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

@router.get("")
async def get_arboles_no_slash():
    return await get_arboles()

@router.get("/")
async def get_arboles():
    """Obtiene todos los árboles con frutos y completa ubicaciones."""
    try:
        # 1. Estados cacao (obtener primero para mapear)
        try:
            estados_res = supabase.table("estado_cacao").select("estado_cacao_id, nombre").execute()
            if hasattr(estados_res, 'error') and estados_res.error:
                print(f"⚠️ Error obteniendo estados: {estados_res.error.message}")
                estados = {}
            else:
                estados = {e["estado_cacao_id"]: e["nombre"] for e in estados_res.data or []}
        except Exception as e:
            print(f"⚠️ Error obteniendo estados: {e}")
            estados = {}
        
        # 2. Árboles con frutos
        try:
            arboles_res = supabase.rpc("get_arboles_with_frutos").execute()
            if hasattr(arboles_res, 'error') and arboles_res.error:
                raise Exception(f"RPC error: {arboles_res.error.message}")
            arboles_raw = arboles_res.data or []
            # Mapear estados de frutos que vienen de la RPC
            arboles = []
            for a in arboles_raw:
                frutos_mapeados = []
                for fruto in a.get("frutos", []):
                    estado_uuid = fruto.get("estado_fruto")
                    estado_nombre = estados.get(estado_uuid, "Desconocido") if estado_uuid else "Desconocido"
                    frutos_mapeados.append({
                        "fruto_id": fruto.get("fruto_id"),
                        "especie": fruto.get("especie"),
                        "estado_fruto": estado_nombre
                    })
                arboles.append({
                    **a,
                    "frutos": frutos_mapeados
                })
        except Exception as rpc_error:
            # Si la RPC falla, usar tabla directa
            print(f"⚠️ RPC get_arboles_with_frutos falló, usando tabla directa: {rpc_error}")
            arboles_res = supabase.table("arbol").select("arbol_id, cultivo_id, nombre, especie, estado_arbol, ubicacion").eq("estado", True).execute()
            if hasattr(arboles_res, 'error') and arboles_res.error:
                raise HTTPException(status_code=500, detail=arboles_res.error.message)
            arboles_data = arboles_res.data or []
            
            # Obtener frutos por separado y mapear estados (estados ya obtenidos arriba)
            arboles = []
            for a in arboles_data:
                frutos_res = supabase.table("fruto").select("fruto_id, especie, estado_fruto").eq("arbol_id", a["arbol_id"]).execute()
                frutos_raw = frutos_res.data or [] if not hasattr(frutos_res, 'error') or not frutos_res.error else []
                # Mapear estados de frutos
                frutos = [
                    {
                        "fruto_id": f["fruto_id"],
                        "especie": f.get("especie"),
                        "estado_fruto": estados.get(f.get("estado_fruto"), "Desconocido") if f.get("estado_fruto") else "Desconocido"
                    }
                    for f in frutos_raw
                ]
                arboles.append({
                    **a,
                    "frutos": frutos
                })

        # 3. Cultivos
        cultivos_res = supabase.table("cultivo").select("cultivo_id, nombre, poligono").execute()
        if hasattr(cultivos_res, 'error') and cultivos_res.error:
            raise HTTPException(status_code=500, detail=cultivos_res.error.message)
        cultivos = cultivos_res.data or []

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

        # 5. Normalizar arboles (estados ya mapeados arriba)
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

            # Mapear estados de frutos si aún no están mapeados
            frutos_normalizados = []
            for fruto in a.get("frutos", []):
                if isinstance(fruto, dict):
                    estado_fruto = fruto.get("estado_fruto")
                    # Si es UUID, mapearlo; si ya es texto, dejarlo
                    if estado_fruto and estado_fruto not in estados.values():
                        estado_fruto = estados.get(estado_fruto, "Desconocido")
                    elif not estado_fruto:
                        estado_fruto = "Desconocido"
                    frutos_normalizados.append({
                        "fruto_id": fruto.get("fruto_id"),
                        "especie": fruto.get("especie"),
                        "estado_fruto": estado_fruto
                    })
            
            result.append({
                "arbol_id": a["arbol_id"],
                "cultivo_id": a["cultivo_id"],
                "nombre": a.get("nombre"),
                "ubicacion": ubicacion,
                "estado_arbol": estados.get(a.get("estado_arbol"), "Desconocido") if a.get("estado_arbol") else "Desconocido",
                "frutos": frutos_normalizados if frutos_normalizados else a.get("frutos", []),
            })

        print(f"✅ Árboles obtenidos: {len(result)}")
        return {"arboles": result}

    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"❌ Error en get_arboles: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
