#!/usr/bin/env python3
"""
upload_arboles_y_frutos.py
Sube los árboles del archivo arboles_output.json y sus frutos asociados.
"""

import os
import json
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

JSON_PATH = r"C:\Users\luisa\Downloads\arboles_output (1).json"

def load_env():
    load_dotenv()
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise SystemExit("❌ Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)

def get_estado_id(sb: Client, nombre_estado: str) -> str:
    """Busca el ID del estado en la tabla estado_cacao"""
    data = sb.table("estado_cacao").select("estado_cacao_id").eq("nombre", nombre_estado).execute()
    if not data.data:
        raise ValueError(f"No se encontró estado_cacao '{nombre_estado}'")
    return data.data[0]["estado_cacao_id"]

def insert_arbol(sb: Client, arbol: dict, estado_id: str):
    """Inserta un árbol en la tabla arbol"""
    ubicacion = json.dumps(arbol["ubicacion"])  # GeoJSON como JSONB
    data = {
        "arbol_id": arbol["arbol_id"],
        "cultivo_id": arbol["cultivo_id"],
        "nombre": arbol["nombre"],
        "especie": "Cacao",
        "ubicacion": ubicacion,
        "estado_cacao_id": estado_id,
        "estado": True
    }
    res = sb.table("arbol").insert(data).execute()
    return res

def insert_fruto(sb: Client, fruto: dict, arbol_id: str, estado_id: str):
    """Inserta un fruto en la tabla fruto"""
    data = {
        "fruto_id": fruto["fruto_id"],
        "arbol_id": arbol_id,
        "especie": fruto["especie"],
        "estado_cacao_id": estado_id
    }
    return sb.table("fruto").insert(data).execute()

def main():
    sb = load_env()
    p = Path(JSON_PATH)
    if not p.exists():
        raise SystemExit(f"No se encontró el archivo {p}")

    with open(p, "r", encoding="utf-8") as f:
        arboles = json.load(f)["arboles"]

    print(f"🌳 Procesando {len(arboles)} árboles...")
    inserted_arboles = 0
    inserted_frutos = 0
    errores = 0

    for a in arboles:
        try:
            estado_arbol = a.get("estado_arbol", "Desconocido")
            estado_arbol_id = get_estado_id(sb, estado_arbol)
            insert_arbol(sb, a, estado_arbol_id)
            inserted_arboles += 1
            print(f"✅ Árbol insertado: {a['nombre']}")

            for f in a.get("frutos", []):
                estado_fruto_id = get_estado_id(sb, f["estado_fruto"])
                insert_fruto(sb, f, a["arbol_id"], estado_fruto_id)
                inserted_frutos += 1

        except Exception as e:
            errores += 1
            print(f"❌ Error con '{a['nombre']}': {e}")

    print("----- resumen -----")
    print(f"Árboles insertados: {inserted_arboles}")
    print(f"Frutos insertados: {inserted_frutos}")
    print(f"Errores: {errores}")

if __name__ == "__main__":
    main()
