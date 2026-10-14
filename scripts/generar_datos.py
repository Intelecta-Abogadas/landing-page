r"""
Writes src/cotejo/datos.ts from the backend's scoring module, so the browser filter uses
the very same stopwords, legal forms and generic words as the weekly run.

Run with the backend's environment:
  ..\marcas-app-backend\.venv\Scripts\python.exe scripts\generar_datos.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
BACKEND = AQUI.parent.parent / "marcas-app-backend"
sys.path.insert(0, str(BACKEND))

from marcas_service.scoring import ALGORITHM_VERSION  # noqa: E402
from marcas_service.scoring.generic import GENERIC_DF_THRESHOLD, GENERIC_MATCH_WEIGHT  # noqa: E402
from marcas_service.scoring.generic_tokens import GENERIC_TOKEN_DOC_FREQ  # noqa: E402
from marcas_service.scoring.stopwords import BRAND_STOPWORDS  # noqa: E402

genericas = sorted(t for t, df in GENERIC_TOKEN_DOC_FREQ.items() if df >= GENERIC_DF_THRESHOLD)
vacias = sorted(BRAND_STOPWORDS)

salida = AQUI.parent / "src" / "cotejo" / "datos.ts"
salida.write_text(
    "// Generado por scripts/generar_datos.py desde marcas-app-backend. No editar a mano.\n\n"
    f"export const VERSION_DEL_FILTRO = {json.dumps(ALGORITHM_VERSION)};\n\n"
    f"export const PESO_GENERICA = {GENERIC_MATCH_WEIGHT};\n\n"
    f"export const PALABRAS_VACIAS = new Set<string>({json.dumps(vacias, ensure_ascii=False)});\n\n"
    f"export const PALABRAS_GENERICAS = new Set<string>({json.dumps(genericas, ensure_ascii=False)});\n",
    encoding="utf-8",
)
print(f"{salida}: {len(vacias)} vacías, {len(genericas)} genéricas, {ALGORITHM_VERSION}")
