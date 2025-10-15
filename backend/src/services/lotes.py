from fastapi import APIRouter, HTTPException
from src.utils.supaBaseClient import supabase
from starlette.concurrency import run_in_threadpool

router = APIRouter()

@router.get("/")
async def get_lotes():
    try:
        response = await run_in_threadpool(lambda: supabase.rpc("get_lotes_with_estado").execute())

        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        lotes = response.data or []

        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": l["geometry"],
                    "properties": {
                        "lote_id": l["lote_id"],
                        "nombre": l["nombre"],
                        "finca": l.get("finca", "Sin finca"),
                        "estado": (l.get("estado") or "").lower(),
                    },
                }
                for l in lotes
            ],
        }

        return geojson

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
