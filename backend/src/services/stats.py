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
        # Query base
        query = supabase.from_("finca").select("""
            finca_id,
            nombre,
            created_at,
            lote (
                lote_id,
                nombre,
                cultivo (
                    cultivo_id,
                    nombre,
                    arbol (
                        arbol_id,
                        nombre,
                        especie,
                        fruto (
                            fruto_id,
                            especie,
                            created_at,
                            estado_cacao ( nombre )
                        )
                    )
                )
            )
        """)

        # Aplicar filtros
        if finca_id:
            query = query.eq("finca_id", finca_id)

        response = await run_in_threadpool(lambda: query.execute())

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        fincas = response.data or []

        # Filtrar lote si se especifica
        if lote_id:
            for finca in fincas:
                finca["lote"] = [l for l in finca.get("lote", []) if l["lote_id"] == lote_id]

        # Calcular estadísticas
        conteo_general = contar_estados(fincas)
        estructura_general = contar_estructura(fincas)

        # Estadísticas por finca
        stats_por_finca = []
        for finca in fincas:
            conteo_finca = contar_estados([finca])
            estructura_finca = contar_estructura([finca])
            stats_por_finca.append({
                "finca_id": finca["finca_id"],
                "nombre": finca["nombre"],
                "conteo": conteo_finca,
                "estructura": estructura_finca,
            })

        return {
            "resumen_general": {
                "conteo": conteo_general,
                "estructura": estructura_general,
            },
            "por_finca": stats_por_finca,
            "fincas": fincas,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fincas")
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


@router.get("/zones")
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


@router.get("/metrics/{arbol_id}")
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

