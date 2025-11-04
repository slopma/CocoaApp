from fastapi import APIRouter, HTTPException, Query
from src.db import supabase
from starlette.concurrency import run_in_threadpool
from typing import Optional

router = APIRouter()


def contar_estados(fincas: list) -> dict:
    """Cuenta estados de frutos de manera recursiva"""
    conteo = {}

    def recorrer(elemento):
        if isinstance(elemento, dict):
            if "fruto_id" in elemento:
                estado = elemento.get("estado_cacao", {}).get("nombre", "Desconocido")
                conteo[estado] = conteo.get(estado, 0) + 1
            elif "fruto" in elemento:
                for f in elemento.get("fruto", []):
                    recorrer(f)
            elif "arbol" in elemento:
                for a in elemento.get("arbol", []):
                    recorrer(a)
            elif "cultivo" in elemento:
                for c in elemento.get("cultivo", []):
                    recorrer(c)
            elif "lote" in elemento:
                for l in elemento.get("lote", []):
                    recorrer(l)

    for finca in fincas:
        recorrer(finca)

    return conteo


def contar_estructura(fincas: list) -> dict:
    """Cuenta la estructura completa de fincas"""
    fincas_count = len(fincas)
    lotes_count = 0
    cultivos_count = 0
    arboles_count = 0
    frutos_count = 0

    for finca in fincas:
        lotes = finca.get("lote", [])
        lotes_count += len(lotes)
        for lote in lotes:
            cultivos = lote.get("cultivo", [])
            cultivos_count += len(cultivos)
            for cultivo in cultivos:
                arboles = cultivo.get("arbol", [])
                arboles_count += len(arboles)
                for arbol in arboles:
                    frutos = arbol.get("fruto", [])
                    frutos_count += len(frutos)

    return {
        "fincas": fincas_count,
        "lotes": lotes_count,
        "cultivos": cultivos_count,
        "arboles": arboles_count,
        "frutos": frutos_count,
    }




@router.get("/") 
async def get_stats(
    finca_id: Optional[str] = Query(None),
    lote_id: Optional[str] = Query(None)
):
    """Obtiene estadísticas completas con filtros opcionales"""
    try:
        import re
        
        # 1. Contar fincas
        fincas_query = supabase.from_("finca").select("finca_id, nombre")
        if finca_id:
            fincas_query = fincas_query.eq("finca_id", finca_id)
        fincas_resp = await run_in_threadpool(lambda: fincas_query.execute())
        fincas_count = len(fincas_resp.data or [])
        
        # 2. Contar zonas (lotes con polígono)
        zonas_query = supabase.from_("lote").select("lote_id, nombre, poligono").not_.is_("poligono", None)
        if finca_id:
            zonas_query = zonas_query.eq("finca_id", finca_id)
        zonas_resp = await run_in_threadpool(lambda: zonas_query.execute())
        zonas = zonas_resp.data or []
        zonas_count = len(zonas)
        
        # 3. Crear mapa de nombres de zonas para mapear cultivos
        nombre_a_zona_id = {}
        for zona in zonas:
            nombre = zona.get("nombre", "")
            zona_id = zona.get("lote_id")
            if nombre and zona_id:
                variantes = {
                    nombre,
                    re.sub(r"^Zona\s+", "Lote ", nombre),
                    re.sub(r"^Lote\s+", "Zona ", nombre),
                }
                for v in variantes:
                    if v and v not in nombre_a_zona_id:
                        nombre_a_zona_id[v] = zona_id
        
        # 4. Obtener todos los cultivos y mapearlos a zonas
        cultivos_query = supabase.from_("cultivo").select("cultivo_id, nombre, lote_id").eq("estado", True)
        cultivos_resp = await run_in_threadpool(lambda: cultivos_query.execute())
        cultivos = cultivos_resp.data or []
        
        # Mapear cultivos a zonas por nombre
        cultivos_mapeados = set()
        for cultivo in cultivos:
            nombre_cultivo = cultivo.get("nombre", "")
            prefijo = re.sub(r"\s+-\s+.*$", "", nombre_cultivo).strip()
            zona_id = nombre_a_zona_id.get(prefijo) or nombre_a_zona_id.get(re.sub(r"^Lote\s+", "Zona ", prefijo)) or nombre_a_zona_id.get(re.sub(r"^Zona\s+", "Lote ", prefijo))
            if zona_id:
                cultivos_mapeados.add(cultivo.get("cultivo_id"))
        
        cultivos_count = len(cultivos_mapeados)
        
        # 5. Contar TODOS los árboles activos (no solo los de cultivos mapeados)
        arboles_query = supabase.from_("arbol").select("arbol_id, cultivo_id").eq("estado", True)
        arboles_resp = await run_in_threadpool(lambda: arboles_query.execute())
        arboles_count = len(arboles_resp.data or [])
        
        # 6. Contar TODOS los frutos de TODOS los árboles activos
        arboles_ids = [a.get("arbol_id") for a in (arboles_resp.data or []) if a.get("arbol_id")]
        frutos_count = 0
        if arboles_ids:
            # Contar todos los frutos de todos los árboles activos
            frutos_query = supabase.from_("fruto").select("fruto_id").in_("arbol_id", arboles_ids)
            frutos_data = await run_in_threadpool(lambda: frutos_query.execute())
            frutos_count = len(frutos_data.data or [])
        
        # 7. Contar estados de TODOS los frutos (incluyendo todos los estados)
        conteo_general = {}
        if arboles_ids:
            frutos_estados_resp = await run_in_threadpool(
                lambda: supabase.from_("fruto")
                .select("fruto_id, estado_fruto, estado_cacao(nombre)")
                .in_("arbol_id", arboles_ids)
                .execute()
            )
            for fruto in (frutos_estados_resp.data or []):
                estado = "Desconocido"
                if isinstance(fruto.get("estado_cacao"), dict):
                    estado = fruto.get("estado_cacao", {}).get("nombre", "Desconocido")
                elif fruto.get("estado_fruto"):
                    # Si no hay relación, intentar obtener el estado directamente
                    estado_uuid = fruto.get("estado_fruto")
                    if estado_uuid:
                        try:
                            estado_resp = await run_in_threadpool(
                                lambda: supabase.from_("estado_cacao")
                                .select("nombre")
                                .eq("estado_cacao_id", estado_uuid)
                                .single()
                                .execute()
                            )
                            if estado_resp.data:
                                estado = estado_resp.data.get("nombre", "Desconocido")
                        except:
                            estado = "Desconocido"
                conteo_general[estado] = conteo_general.get(estado, 0) + 1
        
        estructura_general = {
            "fincas": fincas_count,
            "lotes": zonas_count,  # Zonas con polígono
            "cultivos": cultivos_count,
            "arboles": arboles_count,
            "frutos": frutos_count,
        }

        # Estadísticas por finca (simplificado para el nuevo enfoque)
        stats_por_finca = []
        fincas_data = fincas_resp.data or []
        for finca in fincas_data:
            # Para cada finca, usar las mismas estadísticas generales por ahora
            # (en el futuro se puede optimizar para contar por finca específica)
            stats_por_finca.append({
                "finca_id": finca.get("finca_id"),
                "nombre": finca.get("nombre"),
                "conteo": conteo_general,
                "estructura": estructura_general,
            })

        return {
            "resumen_general": {
                "conteo": conteo_general,
                "estructura": estructura_general,
            },
            "por_finca": stats_por_finca,
            "fincas": fincas_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fincas/")
async def get_fincas_list():
    """Obtiene lista simple de fincas para filtros"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.from_("finca").select("finca_id, nombre").execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lotes")
async def get_lotes_by_finca(finca_id: str = Query(...)):
    """Obtiene lotes de una finca específica"""
    try:
        finca_id = finca_id.strip().strip("/")
        response = await run_in_threadpool(
            lambda: supabase.from_("lote")
            .select("lote_id, nombre")
            .eq("finca_id", finca_id)
            .execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zones/")
async def get_zones_hierarchy():
    """Obtiene jerarquía completa para ZonesScreen"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.from_("finca").select("""
                finca_id,
                nombre,
                created_at,
                lote!lote_finca_id_fkey (
                    lote_id,
                    nombre,
                    cultivo!cultivo_lote_id_fkey (
                        cultivo_id,
                        nombre,
                        arbol!arbol_cultivo_id_fkey (
                            arbol_id,
                            nombre,
                            fruto!fruto_arbol_id_fkey (
                                fruto_id,
                                especie
                            )
                        )
                    )
                )
            """).execute()
        )

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics/{arbol_id}/")
async def get_arbol_metrics(arbol_id: str):
    """Obtiene métricas de un árbol específico"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.from_("metrics")
            .select("metric_id, raw, voltaje, capacitancia, created_at")
            .eq("arbol_id", arbol_id)
            .order("created_at", ascending=False)
            .execute()
        )

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

