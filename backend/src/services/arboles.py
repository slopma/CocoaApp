from fastapi import APIRouter, HTTPException
from src.db import supabase
import math

router = APIRouter()

def simple_hash(s: str) -> int:
    """Hash determinístico simple (igual al del frontend)."""
    h = 0
    for ch in s:
        h = (h << 5) - h + ord(ch)
        h &= 0xFFFFFFFF
    return abs(h)

def get_offset_from_hash(arbol_id: str, delta: float = 0.0003):
    """Offset determinístico para dispersar puntos."""
    h1 = simple_hash(arbol_id)
    h2 = simple_hash(arbol_id[::-1])  # reverso del string
    lat_offset = ((h1 % 1000) / 1000 - 0.5) * delta
    lng_offset = ((h2 % 1000) / 1000 - 0.5) * delta
    return lat_offset, lng_offset

@router.get("/")
async def get_arboles():
    """Obtiene todos los árboles con frutos y completa ubicaciones."""
    try:
        # 1. Árboles con frutos
        arboles_res = supabase.rpc("get_arboles_with_frutos").execute()
        if hasattr(arboles_res, 'error') and arboles_res.error:
            raise HTTPException(status_code=500, detail=arboles_res.error.message)
        arboles = arboles_res.data or []

        # 2. Cultivos
        cultivos_res = supabase.table("cultivo").select("cultivo_id, nombre, poligono").execute()
        if hasattr(cultivos_res, 'error') and cultivos_res.error:
            raise HTTPException(status_code=500, detail=cultivos_res.error.message)
        cultivos = cultivos_res.data or []

        # 3. Estados cacao
        estados_res = supabase.table("estado_cacao").select("estado_cacao_id, nombre").execute()
        if hasattr(estados_res, 'error') and estados_res.error:
            raise HTTPException(status_code=500, detail=estados_res.error.message)
        estados = {e["estado_cacao_id"]: e["nombre"] for e in estados_res.data or []}

        # 4. Calcular centroides de cultivos
        centroides_por_cultivo = {}
        for c in cultivos:
            try:
                coords = c["poligono"]["coordinates"][0]
                xs = [p[0] for p in coords]
                ys = [p[1] for p in coords]
                centro = (sum(xs) / len(xs), sum(ys) / len(ys))
                centroides_por_cultivo[c["cultivo_id"]] = centro
            except Exception:
                pass

        # 5. Normalizar arboles
        result = []
        for a in arboles:
            ubicacion = a.get("ubicacion")
            if not ubicacion:
                centro = centroides_por_cultivo.get(a["cultivo_id"])
                if centro:
                    lat_offset, lng_offset = get_offset_from_hash(a["arbol_id"], 0.0003)
                    ubicacion = {
                        "type": "Point",
                        "coordinates": [centro[0] + lng_offset, centro[1] + lat_offset],
                    }

            # Convertimos cada fruto: estado_fruto UUID -> nombre
            frutos = []
            for f in a.get("frutos", []):
                estado_id = f.get("estado_fruto")  # UUID
                frutos.append({
                    **f,
                    "estado_fruto": estados.get(estado_id, "Inmaduro")  # default
                })

            result.append({
                "arbol_id": a["arbol_id"],
                "cultivo_id": a["cultivo_id"],
                "nombre": a.get("nombre"),
                "ubicacion": ubicacion,
                "estado_arbol": estados.get(a.get("estado_arbol"), "Desconocido"),
                "frutos": frutos,  # reemplaza por frutos con nombre
            })


        return {"arboles": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
