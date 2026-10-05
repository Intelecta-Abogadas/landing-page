r"""
Writes src/cotejo/casos.json: what the backend's real filter answers for a set of pairs,
so `src/cotejo/cotejo.test.ts` checks the browser port against it.

  ..\marcas-app-backend\.venv\Scripts\python.exe scripts\generar_casos.py
"""

from __future__ import annotations

import json
import random
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "marcas-app-backend"))

import jellyfish  # noqa: E402
from abydos.phonetic import SpanishMetaphone  # noqa: E402

from marcas_service.scoring import denomination_score_breakdown  # noqa: E402
from marcas_service.scoring.spanish_phonetic import spanish_phonetic_key  # noqa: E402
from marcas_service.scoring.stopwords import meaningful_tokens  # noqa: E402

EJEMPLOS = json.loads((AQUI.parent / "src" / "cotejo" / "ejemplos.json").read_text(encoding="utf-8"))

_SM = SpanishMetaphone(max_length=10, modified=True)

# The backend's own regression pairs and the traps its comments name.
DEL_BACKEND = [
    ("MJC SERVICIOS AGROPECUARIOS S.A.", "B BOB'S CAFÉ"),
    ("2B WILD RIDE YOUR FREEDOM", "B BOB'S CAFÉ"),
    ("B BARTOLOMÉ GRUPO INMOBILIARIO", "B BOB'S CAFÉ"),
    ("2B WILD RIDE YOUR FREEDOM", "V."),
    ("ARKY STUDIO", "MORGAN STUDIO"),
    ("KIRA HOME · BAZAR & DECO", "SMART BAZAR"),
    ("KIRA HOME · BAZAR & DECO", "ALTESSA HOME"),
    ("LA DIETÉTICA NATURAL MARKET", "PEKE MARKET"),
    ("FCA ASSET MANAGEMENT", "BIGTELLIGENT DATA MANAGEMENT AND DESIGN"),
    ("BIO DIDACTIKA ENSEÑAMOS CIENCIA QUE INSPIRA", "SOLOCANIS EL ALIADO QUE TU PERRO NECESITA"),
    ("BIO DIDACTIKA ENSEÑAMOS CIENCIA QUE INSPIRA", "COFRE DIDÁCTICO"),
    ("CONECTAR CULTURA", "CONECTA FRANQUICIAS"),
    ("COLILUX", "DECOLUX"),
    ("cerveza", "servesa"),
    ("FLASH", "FLASH CORREO PRIVADO MAYORISTA"),
    ("MEP", "#MEP MUJERES EN PUBLICIDAD"),
    ("PURAFARMA DONDE LA SALUD EMPIEZA +", "PS CENTRO PROYECTAR SALUD"),
    ("PJ", "PJ LIBRARY"),
    ("PJ", "PJOTA LIBRARY"),
    ("FUNKO", "CIA LOS FUNKOS SSA ARG"),
    ("AIRE PURO", "PURAIRE"),
    ("NOVA", "NOVA DRAGON"),
    ("KRAC", "COMARCA"),
    ("SYNCRO", "ASUNCION"),
    ("LA ALEGRIA", "LA TRISTEZA"),
    ("MONA", "SIMONA"),
    ("RADO", "SAGRADO"),
    ("CENTRO", "SYNCRO"),
    ("I.N.S ELECTRICIDAD", "INS ELECTRIC"),
    ("ONE TOUCH", "ONETOUCH"),
    ("THE KNIGHT", "NIGHT"),
    ("PHOENIX", "FENIX"),
    ("SHOWROOM", "CHOUROOM"),
    ("WHISKY BAR", "GÜISQUI"),
    ("XANADU", "ZANADU"),
    ("GNOMO", "NOMO"),
    ("SIGN", "SAIN"),
    ("HACHE", "ACHE"),
    ("LLUVIA", "YUBIA"),
    ("QUESERÍA", "KESERIA"),
    ("ÑANDÚ", "NIANDU"),
    ("ACCIÓN", "AXION"),
    ("PSICO", "SICO"),
    ("SCOTT", "ESCOT"),
    ("MBOPI", "NBOPI"),
    # Where the compiled jellyfish and Python's ASCII-only word edges once differed.
    ("LAMB", "LAM"),
    ("HIGH", "HI"),
    ("ALIGN", "ALINE"),
    ("CONVERSACIONES INCÓMODAS", "INC CONVERSACIONES"),
    ("PROVEEDOR DE MATERIALES S.A.", "CONVERSACIONES INCÓMODAS PARA GENTE"),
    ("BOB'S CAFÉ", "BOBS CAFE"),
]

PALABRAS = (
    "sol luna casa mar brisa norte sur andes plata rio monte verde azul roja nube faro "
    "kiwi quimera zafiro cobalto tango mate yerba cafe vino bodega pampa ceibo ombu jacaranda "
    "nova lux flash smart tech digital lab studio market home pet club life pro max "
    "hierro vidrio madera piedra arena cielo fuego agua tierra aire puro claro oscuro "
    "chacra quinta estancia granja huerta campo valle sierra lago isla bahia puerto "
    "xilo zeta kappa omega delta sigma gamma vector pixel nexo axis orbita"
).split()


def sinteticos(n: int) -> list[tuple[str, str]]:
    azar = random.Random(20261001)
    pares = []
    for _ in range(n):
        a = " ".join(azar.sample(PALABRAS, azar.randint(1, 3)))
        b_partes = azar.sample(PALABRAS, azar.randint(1, 4))
        if azar.random() < 0.4:
            b_partes[0] = a.split()[0]
        b = " ".join(b_partes)
        if azar.random() < 0.3:
            b = b.replace("c", "k", 1).replace("v", "b", 1)
        pares.append((a.upper(), b.upper()))
    return pares


def caso(a: str, b: str) -> dict:
    d = denomination_score_breakdown(a, b)
    return {
        "a": a,
        "b": b,
        "literal": d["literal"],
        "castellano": d["phonetic_es"],
        "ingles": d["phonetic_en"],
        "contencion": d["extension"],
        "parecido": d["compositeMax"],
    }


ejemplos = [(e["tuya"], e["publicada"]) for e in EJEMPLOS]
pares = ejemplos + DEL_BACKEND + sinteticos(400)
palabras = sorted({t for a, b in pares for t in meaningful_tokens(a) + meaningful_tokens(b)})

salida = {
    "pares": [caso(a, b) for a, b in pares],
    "claves": [
        {
            "palabra": p,
            "castellano": spanish_phonetic_key(p),
            "metaphone": _SM.encode(p),
            "ingles": jellyfish.metaphone(p),
        }
        for p in palabras
    ],
}
ruta = AQUI.parent / "src" / "cotejo" / "casos.json"
ruta.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{ruta}: {len(salida['pares'])} pares, {len(salida['claves'])} palabras")
for e in ejemplos:
    c = caso(*e)
    print(f"  {e[0]!r:28} {e[1]!r:34} parecido {c['parecido']:.3f}  lit {c['literal']:.2f} es {c['castellano']:.2f} en {c['ingles']:.2f} ext {c['contencion']:.2f}")
