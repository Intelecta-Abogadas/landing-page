"""Builds src/legales/documentos.json from the studio's Word file of terms and privacy.

The text goes through untouched: wording, capitals, bold and list types as the studio wrote them.
The only edit is the CUIT format (20-38759781-7), asked for by the owner.

    py scripts/generar_legales.py "TÉRMINOS Y CONDICIONES DE USO Y PP.docx"
"""

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
SALIDA = Path(__file__).resolve().parent.parent / "src" / "legales" / "documentos.json"
DOCUMENTOS = ("terminos", "privacidad")
CLAUSULA = re.compile(r"^(\d+)\.\s")
CUIT = re.compile(r"(CUIT:?\s*)(\d{2})-?(\d{8})-?(\d)")
DIRECCION = re.compile(r"^https?://\S+$")


def activo(rpr, etiqueta):
    marca = rpr.find(W + etiqueta) if rpr is not None else None
    return marca is not None and marca.get(W + "val") not in ("0", "false", "none")


def partes_del_parrafo(parrafo):
    partes = []
    for corrida in parrafo.iter(W + "r"):
        rpr = corrida.find(W + "rPr")
        texto = "".join(t.text or "" for t in corrida.iter(W + "t"))
        # Word underlines the site address as a link; the page links it too. Anything else is unexpected.
        for marca in ("i", "u", "strike"):
            if activo(rpr, marca) and not (marca == "u" and DIRECCION.match(texto)):
                sys.exit(f"Formato no previsto ({marca}) en: {''.join(t.text or '' for t in parrafo.iter(W + 't'))}")
        if corrida.find(W + "tab") is not None or corrida.find(W + "br") is not None:
            sys.exit("El documento trae tabulaciones o saltos de línea dentro de un párrafo")
        if not texto:
            continue
        negrita = activo(rpr, "b")
        if partes and partes[-1]["negrita"] == negrita:
            partes[-1]["texto"] += texto
        else:
            partes.append({"texto": texto, "negrita": negrita})
    if partes:
        partes[0]["texto"] = partes[0]["texto"].lstrip()
        partes[-1]["texto"] = partes[-1]["texto"].rstrip()
    partes = [p for p in partes if p["texto"]]
    for parte in partes:
        parte["texto"] = CUIT.sub(lambda m: f"{m[1]}{m[2]}-{m[3]}-{m[4]}", parte["texto"])
    return partes


def formatos_de_lista(docx):
    numeracion = ET.fromstring(docx.read("word/numbering.xml"))
    abstractos = {}
    for abstracto in numeracion.iter(W + "abstractNum"):
        nivel = next(n for n in abstracto.iter(W + "lvl") if n.get(W + "ilvl") == "0")
        abstractos[abstracto.get(W + "abstractNumId")] = nivel.find(W + "numFmt").get(W + "val")
    return {
        num.get(W + "numId"): abstractos[num.find(W + "abstractNumId").get(W + "val")]
        for num in numeracion.iter(W + "num")
    }


def leer(ruta):
    with zipfile.ZipFile(ruta) as docx:
        formatos = formatos_de_lista(docx)
        cuerpo = ET.fromstring(docx.read("word/document.xml")).find(W + "body")

    documentos = []
    for parrafo in cuerpo.iter(W + "p"):
        ppr = parrafo.find(W + "pPr")
        estilo = ppr.find(W + "pStyle").get(W + "val") if ppr is not None and ppr.find(W + "pStyle") is not None else ""
        partes = partes_del_parrafo(parrafo)
        if not partes:
            continue
        texto = "".join(p["texto"] for p in partes)

        if estilo == "Heading1":
            documentos.append({"titulo": texto, "inicio": [], "clausulas": []})
            continue
        if not documentos:
            sys.exit(f"Texto antes del primer título: {texto}")
        documento = documentos[-1]

        if estilo == "Heading2" and CLAUSULA.match(texto) and all(p["negrita"] for p in partes):
            numero = int(CLAUSULA.match(texto)[1])
            documento["clausulas"].append({"numero": numero, "titulo": texto, "bloques": []})
            continue

        destino = documento["clausulas"][-1]["bloques"] if documento["clausulas"] else documento["inicio"]
        numeracion = ppr.find(W + "numPr") if ppr is not None else None
        if numeracion is None:
            destino.append({"tipo": "parrafo", "partes": partes})
            continue
        numerada = formatos[numeracion.find(W + "numId").get(W + "val")] != "bullet"
        if destino and destino[-1]["tipo"] == "lista" and destino[-1]["numerada"] == numerada:
            destino[-1]["items"].append(partes)
        else:
            destino.append({"tipo": "lista", "numerada": numerada, "items": [partes]})

    if len(documentos) != len(DOCUMENTOS):
        sys.exit(f"Se esperaban {len(DOCUMENTOS)} documentos y el Word trae {len(documentos)}")
    for documento in documentos:
        numeros = [c["numero"] for c in documento["clausulas"]]
        if numeros != list(range(1, len(numeros) + 1)):
            sys.exit(f"Cláusulas fuera de orden en {documento['titulo']}: {numeros}")
    return dict(zip(DOCUMENTOS, documentos))


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    documentos = leer(sys.argv[1])
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(documentos, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    for clave, documento in documentos.items():
        print(f"{clave}: {documento['titulo']} · {len(documento['clausulas'])} cláusulas")


if __name__ == "__main__":
    main()
