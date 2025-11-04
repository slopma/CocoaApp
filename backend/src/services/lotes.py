from fastapi import APIRouter, HTTPException
from src.db import supabase
from starlette.concurrency import run_in_threadpool
import re

router = APIRouter()


@router.get("") 
async def get_lotes_no_slash():
    return await get_lotes()

@router.get("/") 
async def get_lotes():
    try:
        # Intentar usar la RPC primero, si falla usar tabla directa
        try:
            response = await run_in_threadpool(lambda: supabase.rpc("get_lotes_with_estado").execute())

            if hasattr(response, 'error') and response.error:
                raise Exception(f"RPC error: {response.error.message}")

            lotes_rpc = response.data or []

            # Si la RPC devuelve datos, usarlos directamente (ya incluye todas las zonas con polígono)
            if lotes_rpc and isinstance(lotes_rpc[0], dict):
                # Verificar si tiene geometry o poligono
                if "geometry" in lotes_rpc[0]:
                    geojson = {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": l["geometry"],
                                "properties": {
                                    "lote_id": l.get("lote_id"),
                                    "nombre": re.sub(r"^Zona\s+", "Lote ", l.get("nombre", "")),
                                    "finca": l.get("finca", "Sin finca"),
                                    "estado": str(l.get("estado", "")).lower() if isinstance(l.get("estado"), (str, bool)) else "",
                                },
                            }
                            for l in lotes_rpc
                            if l.get("geometry")
                        ],
                    }
                    print(f"✅ Lotes devueltos desde RPC: {len(geojson['features'])} zonas")
                    return geojson
                elif "poligono" in lotes_rpc[0]:
                    geojson = {
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": l["poligono"],
                                "properties": {
                                    "lote_id": l.get("lote_id"),
                                    "nombre": re.sub(r"^Zona\s+", "Lote ", l.get("nombre", "")),
                                    "finca": l.get("finca", "Sin finca"),
                                    "estado": str(l.get("estado", "")).lower() if isinstance(l.get("estado"), (str, bool)) else "",
                                },
                            }
                            for l in lotes_rpc
                            if l.get("poligono")
                        ],
                    }
                    print(f"✅ Lotes devueltos desde RPC: {len(geojson['features'])} zonas")
                    return geojson
            
            # Si la RPC no devolvió datos útiles, obtener todas las zonas con polígono directamente
            try:
                lotes_geo_resp = await run_in_threadpool(
                    lambda: supabase.table("lote")
                    .select("lote_id, nombre, poligono, estado, finca_id")
                    .not_.is_("poligono", None)
                    .execute()
                )
                lotes_geo = lotes_geo_resp.data or []
                print(f"✅ Lotes obtenidos directamente de tabla: {len(lotes_geo)} zonas")
                
                geojson = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "geometry": l.get("poligono"),
                            "properties": {
                                "lote_id": l.get("lote_id"),
                                "nombre": re.sub(r"^Zona\s+", "Lote ", l.get("nombre", "")),
                                "finca": "Sin finca",
                                "estado": str(l.get("estado", "")).lower() if isinstance(l.get("estado"), (str, bool)) else "",
                            },
                        }
                        for l in lotes_geo
                        if l.get("poligono")
                    ],
                }
                return geojson
            except Exception as e:
                print(f"⚠️ Error obteniendo lotes con poligono: {e}")
                raise
        except Exception as rpc_error:
            # Si la RPC falla, usar tabla directa
            print(f"⚠️ RPC falló, usando tabla directa: {rpc_error}")
            response = await run_in_threadpool(
                lambda: supabase.table("lote")
                .select("lote_id, nombre, poligono, estado, finca_id")
                .eq("estado", True)
                .execute()
            )
            
            if hasattr(response, 'error') and response.error:
                raise HTTPException(status_code=500, detail=response.error.message)
            
            # Fallback: obtener todas las zonas con polígono directamente
            lotes = response.data or []
            
            # Filtrar solo los que tienen polígono (todas las zonas verdes)
            geojson = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": l.get("poligono"),
                        "properties": {
                            "lote_id": l.get("lote_id"),
                            "nombre": re.sub(r"^Zona\s+", "Lote ", l.get("nombre", "")),
                            "finca": "Sin finca",
                            "estado": str(l.get("estado", "")).lower() if isinstance(l.get("estado"), (str, bool)) else "",
                        },
                    }
                    for l in lotes
                    if l.get("poligono")
                ],
            }
            print(f"✅ Lotes devueltos (fallback): {len(geojson['features'])} zonas")
            return geojson

    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"❌ Error en get_lotes: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
