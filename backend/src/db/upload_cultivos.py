#!/usr/bin/env python3
import os, json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

GEOJSON_DEFAULT = r"C:\Users\luisa\Downloads\cultivos_output (1).json"

def load_env():
    load_dotenv()
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise SystemExit("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env")
    return url, key

def call_rpc_insert(sb: Client, nombre: str, especie: str, feature_obj: dict):
    params = {
        "nombre_in": nombre,
        "especie_in": especie,
        # enviar el Feature como dict -> postgrest lo mapeará a json/jsonb correctamente
        "geom_json_in": feature_obj
    }
    res = sb.rpc("insert_cultivo_from_geojson", params).execute()
    if getattr(res, "error", None):
        # Para debug pasamos el detalle
        raise RuntimeError(res.error)
    return res.data or []

def main(geojson_path: str = None):
    geojson_path = Path(geojson_path or GEOJSON_DEFAULT)
    if not geojson_path.exists():
        raise SystemExit(f"No se encontró {geojson_path}")

    url, key = load_env()
    sb = create_client(url, key)

    with geojson_path.open("r", encoding="utf-8") as f:
        gj = json.load(f)

    features = gj.get("features", [])
    inserted = 0
    skipped = 0
    errors = 0

    for i, feat in enumerate(features):
        props = feat.get("properties") or {}
        nombre = props.get("nombre") or props.get("name") or props.get("cultivo_id") or f"Cultivo_{i+1}"
        especie = props.get("especie") or props.get("species") or "Cacao"
        geom = feat.get("geometry")
        if not geom:
            print(f"⚠️ Feature {i+1} sin geometry — se omite")
            skipped += 1
            continue

        try:
            # enviamos el feature completo (la función SQL extrae geometry si viene como Feature)
            res = call_rpc_insert(sb, nombre, especie, feat)
            if res:
                for r in res:
                    print(f"✅ Insertado cultivo {nombre} -> cultivo_id={r.get('cultivo_id')} lote_id={r.get('lote_id')}")
                inserted += 1
            else:
                print(f"ℹ️ No se encontró lote para '{nombre}', omitiendo")
                skipped += 1
        except Exception as e:
            print(f"❌ Error insertando '{nombre}': {e}")
            errors += 1

    print("----- resumen -----")
    print(f"Total features: {len(features)}")
    print(f"Insertados: {inserted}")
    print(f"Omitidos (sin lote): {skipped}")
    print(f"Errores: {errors}")

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--geojson", "-g", default=GEOJSON_DEFAULT)
    args = p.parse_args()
    main(args.geojson)
