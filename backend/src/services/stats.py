from fastapi import APIRouter, HTTPException, Query
from src.db import supabase
from starlette.concurrency import run_in_threadpool
from typing import Optional

router = APIRouter()


# ------------------------------------------------------------
# /stats/fincas/
# ------------------------------------------------------------
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



# ------------------------------------------------------------
# /stats/lotes
# ------------------------------------------------------------
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






# === Funciones auxiliares ===

def contar_estados(fincas: list) -> dict:
    """Cuenta los estados de frutos de toda la jerarquía"""
    conteo = {}

    def recorrer(e):
        if isinstance(e, dict):
            # Fruto con estado
            if "fruto_id" in e:
                estado = e.get("estado_fruto", "Desconocido")
                conteo[estado] = conteo.get(estado, 0) + 1

            # Recorre todos los subniveles: lote, cultivo, arbol, fruto
            for k, v in e.items():
                if isinstance(v, (list, dict)):
                    recorrer(v)

        elif isinstance(e, list):
            for i in e:
                recorrer(i)

    for finca in fincas:
        recorrer(finca)

    return conteo


def contar_estructura(fincas: list) -> dict:
    """Cuenta todos los niveles de jerarquía"""
    counts = {"fincas": len(fincas), "lotes": 0, "cultivos": 0, "arboles": 0, "frutos": 0}

    for finca in fincas:
        lotes = finca.get("lote", [])
        counts["lotes"] += len(lotes)
        for lote in lotes:
            cultivos = lote.get("cultivo", [])
            counts["cultivos"] += len(cultivos)
            for cultivo in cultivos:
                arboles = cultivo.get("arbol", [])
                counts["arboles"] += len(arboles)
                for arbol in arboles:
                    frutos = arbol.get("fruto", [])
                    counts["frutos"] += len(frutos)

    return counts


@router.get("/zones/")
async def get_zones_hierarchy():
    """Obtiene jerarquía completa para el mapa de zonas"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.from_("finca").select("""
                finca_id,
                nombre,
                created_at,
                lotes:lote!lote_finca_id_fkey (
                    lote_id,
                    nombre,
                    cultivos:cultivo!cultivo_lote_id_fkey (
                        cultivo_id,
                        nombre,
                        arboles:arbol!arbol_cultivo_id_fkey (
                            arbol_id,
                            nombre,
                            especie,
                            frutos:fruto!fruto_arbol_id_fkey (
                                fruto_id,
                                especie,
                                created_at,
                                estado_fruto
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


# src/routes/stats.py

@router.get("/")
async def get_stats(
    finca_id: Optional[str] = Query(None),
    lote_id: Optional[str] = Query(None)
):
    """Obtiene estadísticas completas con filtros opcionales"""
    try:
        # === QUERY ORIGINAL (funcional) ===
        query = supabase.from_("finca").select("""
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
                        especie,
                        fruto!fruto_arbol_id_fkey (
                            fruto_id,
                            especie,
                            created_at,
                            estado_fruto
                        )
                    )
                )
            )
        """)


        # Filtros opcionales
        if finca_id:
            query = query.eq("finca_id", finca_id)

        response = await run_in_threadpool(lambda: query.execute())

        if hasattr(response, "error") and response.error:
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
