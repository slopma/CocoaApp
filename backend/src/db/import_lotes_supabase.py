#!/usr/bin/env python3
"""
Importador de lotes y finca desde un GeoJSON a Supabase.
- Crea roles y usuarios (Auth y tabla usuario)
- Crea finca "Finca Yariguies" si no existe
- Inserta geojson_finca y lotes (no inserta 'area' para evitar errores de tipo)
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional, Any
from supabase import create_client, Client
from shapely.geometry import shape
from shapely.ops import transform
import pyproj



# shapely para cálculo de áreas (opcional)
try:
    from shapely.geometry import shape
    SHAPELY_AVAILABLE = True
except Exception:
    SHAPELY_AVAILABLE = False

# ---------- CONFIG ----------
GEOJSON_DEFAULT_PATH = r"C:\Users\luisa\Downloads\lotes.geojson"
FINCA_NAME = "Finca Yariguies"

EXAMPLE_USERS = [
    {"nombre": "Admin Finca", "correo": "admin@finca.local", "rol": "administrador", "password": "admin1234"},
    {"nombre": "Cacao Cultor Ejemplo", "correo": "cacaocultor@finca.local", "rol": "cacao_cultor", "password": "cultor1234"},
    {"nombre": "Investigador Ejemplo", "correo": "investigador@finca.local", "rol": "investigador", "password": "investiga1234"},
]

# ---------- AUXILIARES ----------
def load_env():
    load_dotenv()
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    service_role = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_role:
        raise SystemExit("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env")
    return url, service_role

def _get_email_from_user_obj(u: Any) -> Optional[str]:
    if u is None: return None
    if isinstance(u, dict): return u.get("email")
    return getattr(u, "email", None)

def _get_id_from_user_obj(u: Any) -> Optional[str]:
    if u is None: return None
    if isinstance(u, dict):
        if "id" in u: return u.get("id")
        if isinstance(u.get("user"), dict) and "id" in u["user"]: return u["user"]["id"]
        return None
    return getattr(u, "id", None)

def _normalize_list_users_result(res: Any) -> list:
    if res is None: return []
    if isinstance(res, dict) and "users" in res: return res["users"] or []
    if isinstance(res, list): return res
    users_attr = getattr(res, "users", None)
    if isinstance(users_attr, list): return users_attr
    return [res]

def sb_select_one(sb: Client, table: str, field: str, value, cols="*"):
    res = sb.table(table).select(cols).eq(field, value).limit(1).execute()
    data = getattr(res, "data", res)
    return data[0] if data else None

def sb_insert(sb, table: str, data: dict):
    """Inserta datos en Supabase y devuelve el resultado."""
    res = sb.table(table).insert(data).execute()
    if hasattr(res, "error") and res.error:
        raise Exception(res.error.message)
    return res.data


# ---------- DB / AUTH ----------
def ensure_role(sb: Client, nombre: str, descripcion=""):
    row = sb_select_one(sb, "rol_usuario", "nombre", nombre)
    if row:
        print(f"✅ Rol existente: {nombre}")
        return row["rol_usuario_id"]
    new = sb_insert(sb, "rol_usuario", {"nombre": nombre, "descripcion": descripcion})
    print(f"🆕 Rol creado: {nombre}")
    return new["rol_usuario_id"]

def ensure_auth_user(sb: Client, correo: str, password: str):
    try:
        raw = sb.auth.admin.list_users()
    except Exception as e:
        raise RuntimeError(f"Error al listar usuarios Auth: {e}")

    users = _normalize_list_users_result(raw)
    for u in users:
        email = _get_email_from_user_obj(u)
        if email and email.lower() == correo.lower():
            uid = _get_id_from_user_obj(u)
            print(f"✅ Auth user existente: {correo} (id={uid})")
            return uid

    try:
        created = sb.auth.admin.create_user({"email": correo, "password": password, "email_confirm": True})
    except Exception as e:
        raise RuntimeError(f"Error creando usuario Auth {correo}: {e}")

    created_user_obj = None
    if isinstance(created, dict):
        created_user_obj = created.get("user") or created
    else:
        created_user_obj = getattr(created, "user", None) or created

    new_id = _get_id_from_user_obj(created_user_obj)
    print(f"🆕 Auth user creado: {correo} (id={new_id})")
    return new_id

def ensure_usuario_table(sb: Client, nombre: str, correo: str, rol_nombre: str, auth_id: str):
    row = sb_select_one(sb, "usuario", "correo", correo)
    if row:
        print(f"✅ Usuario existente en tabla usuario: {correo}")
        return row
    rol = sb_select_one(sb, "rol_usuario", "nombre", rol_nombre)
    if not rol:
        raise RuntimeError(f"❌ Rol {rol_nombre} no encontrado.")
    payload = {"auth_id": auth_id, "rol_usuario_id": rol["rol_usuario_id"], "nombre": nombre, "correo": correo}
    inserted = sb_insert(sb, "usuario", payload)
    print(f"🆕 Usuario creado en tabla usuario: {correo}")
    return inserted

def ensure_finca(sb: Client, nombre: str, admin_id: str):
    row = sb_select_one(sb, "finca", "nombre", nombre)
    if row:
        print(f"✅ Finca existente: {nombre}")
        return row
    payload = {"nombre": nombre, "administrador_id": admin_id}
    inserted = sb_insert(sb, "finca", payload)
    print(f"🆕 Finca creada: {nombre}")
    return inserted

def ensure_geojson_finca(sb: Client, finca_id: str, data: dict):
    existing = sb.table("geojson_finca").select("*").eq("finca_id", finca_id).execute()
    existing_data = getattr(existing, "data", existing)
    if existing_data:
        print("✅ geojson_finca ya existe para esta finca.")
        return existing_data[0]
    payload = {"finca_id": finca_id, "data": data}
    inserted = sb_insert(sb, "geojson_finca", payload)
    print("🆕 geojson_finca creado.")
    return inserted

def compute_area(feat):
    if not SHAPELY_AVAILABLE:
        return None
    try:
        geom = shape(feat["geometry"])
        return float(geom.area)
    except Exception:
        return None

def ensure_lote(sb, finca_id, nombre_lote, geometry_geojson):
    """Crea lote con geometría y área calculada."""
    # Convertir a objeto shapely
    geom = shape(geometry_geojson)

    # Proyección a metros (para calcular área en m²)
    project = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True).transform
    geom_m = transform(project, geom)
    area_m2 = geom_m.area

    # Insertar lote con geometría válida
    payload = {
        "finca_id": finca_id,
        "nombre": nombre_lote,
        "area": json.dumps(geometry_geojson),  # guardado como JSON
    }

    inserted = sb_insert(sb, "lote", payload)
    print(f"🆕 Lote creado: {nombre_lote} | Área: {area_m2:.2f} m²")
    return inserted


# ---------- MAIN ----------
def main(geojson_path: Optional[str] = None):
    geojson_path = geojson_path or GEOJSON_DEFAULT_PATH
    geojson_path = Path(geojson_path)
    if not geojson_path.exists():
        raise SystemExit(f"❌ No se encuentra el archivo {geojson_path}")

    url, service_key = load_env()
    sb = create_client(url, service_key)

    # 1) Roles
    for r in ["administrador", "cacao_cultor", "investigador"]:
        ensure_role(sb, r)

    # 2) Usuarios (Auth + tabla)
    usuarios = {}
    for u in EXAMPLE_USERS:
        auth_id = ensure_auth_user(sb, u["correo"], u["password"])
        usr = ensure_usuario_table(sb, u["nombre"], u["correo"], u["rol"], auth_id)
        usuarios[u["rol"]] = usr

    # 3) Finca
    admin_user = usuarios["administrador"]
    finca = ensure_finca(sb, FINCA_NAME, admin_user["usuario_id"])

    # 4) GeoJSON
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)
    ensure_geojson_finca(sb, finca["finca_id"], geojson)

    # 5) Lotes: crear sin enviar 'area', pero calcular y mostrar area localmente (si shapely está disponible)
    for i, feat in enumerate(geojson.get("features", [])):
        props = feat.get("properties", {}) or {}
        nombre_lote = props.get("Lote") or props.get("lote") or props.get("nombre") or props.get("Name") or f"Lote_{i+1}"
        area = compute_area(feat)
        if area is not None:
            print(f"ℹ️ Area calculada (CRS del GeoJSON) para '{nombre_lote}': {area}")
        else:
            print(f"ℹ️ Area no calculada para '{nombre_lote}' (shapely no disponible o geometría inválida).")
        ensure_lote(sb, finca["finca_id"], str(nombre_lote), feat["geometry"])


    print("✅ Importación completa (sin insertar campo 'area' para evitar errores de tipo).")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Importa lotes y crea finca/usuarios en Supabase.")
    parser.add_argument("--geojson", "-g", default=GEOJSON_DEFAULT_PATH, help="Ruta del archivo GeoJSON.")
    args = parser.parse_args()
    main(args.geojson)

