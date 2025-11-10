#!/usr/bin/env python3

import os
import json
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()  # lee backend/.env

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SERVICE_KEY   = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    raise Exception("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env del backend.")

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

### --- funciones auxiliares ----

def get_frutos():
    """Obtiene todos los frutos disponibles en la BD."""
    url = f"{SUPABASE_URL}/rest/v1/fruto?select=fruto_id"
    res = requests.get(url, headers=headers)
    res.raise_for_status()
    return [row["fruto_id"] for row in res.json()]

def get_or_create_estado(nombre):
    """Busca un estado_cacao; si no existe, lo crea."""
    if nombre is None:
        return None

    url = f"{SUPABASE_URL}/rest/v1/estado_cacao?select=estado_cacao_id&nombre=eq.{nombre}"
    res = requests.get(url, headers=headers)

    if res.status_code == 200 and res.json():
        return res.json()[0]["estado_cacao_id"]

    # crear estado
    payload = {"nombre": nombre, "descripcion": f"Creado automáticamente: {nombre}"}
    res = requests.post(f"{SUPABASE_URL}/rest/v1/estado_cacao", headers=headers, data=json.dumps(payload))
    res.raise_for_status()

    # obtener id recién creado
    res = requests.get(url, headers=headers)
    return res.json()[0]["estado_cacao_id"]

def voltage_state(v):
    """Regla de clasificación: voltaje -> estado_cacao."""
    if v is None: return None
    v = float(v)
    if v < 1: return "Inmaduro"
    if 1 <= v < 2: return "Transición"
    if 2 <= v < 3: return "Maduro"
    return "Enfermo"


def process_entry(fruto_id, raw, voltaje, capacitancia, created_at):
    """Inserta en fruto_metric y actualiza fruto"""
    # 1) Insertar historial
    insert_metric = {
        "fruto_id": fruto_id,
        "raw": raw,
        "voltaje": voltaje,
        "capacitancia": capacitancia,
        "created_at": created_at
    }
    requests.post(f"{SUPABASE_URL}/rest/v1/fruto_metric", headers=headers, data=json.dumps(insert_metric))

    # 2) Determinar estado por voltaje
    estado = voltage_state(voltaje)
    estado_cacao_id = get_or_create_estado(estado) if estado else None

    # 3) Actualizar fruto (última lectura)
    update_body = {
        "raw": raw,
        "voltaje": voltaje,
        "capacitancia": capacitancia,
        "updated_at": created_at
    }

    if estado_cacao_id:
        update_body["estado_cacao_id"] = estado_cacao_id

    update_url = f"{SUPABASE_URL}/rest/v1/fruto?fruto_id=eq.{fruto_id}"
    requests.patch(update_url, headers=headers, data=json.dumps(update_body))


### --- Script Principal ----

def main():
    with open(r"C:\Users\luisa\Documents\Deploy_CocoaApp\backend\src\db\feed.json", "r") as f:
        feed = json.load(f)

    entries = feed["feeds"]  # viene así desde ThingSpeak

    frutos = get_frutos()
    if not frutos:
        print("❌ No hay frutos en BD.")
        return

    print(f"🍫 Frutos disponibles: {len(frutos)}")

    for idx, e in enumerate(entries):
        fruto_id = frutos[idx % len(frutos)]  # round-robin

        raw = float(e["field1"]) if e.get("field1") else None
        voltaje = float(e["field2"]) if e.get("field2") else None
        capacitancia = float(e["field3"]) if e.get("field3") else None

        created_at = e.get("created_at") or datetime.now(timezone.utc).isoformat()

        process_entry(fruto_id, raw, voltaje, capacitancia, created_at)

        print(f"✅ Lectura {idx+1}/{len(entries)} asignada a fruto {fruto_id}")

    print("\n🎉 Lecturas cargadas y estados actualizados correctamente en Supabase.")

if __name__ == "__main__":
    main()
