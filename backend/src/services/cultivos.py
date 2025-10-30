from fastapi import APIRouter, HTTPException
from src.db import supabase

router = APIRouter()


@router.get("/") 
async def get_cultivos():
    """Obtiene todos los cultivos en formato GeoJSON"""
    try:
        response = supabase.table("cultivo").select("cultivo_id, nombre, especie, poligono").execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        features = [
            {
                "type": "Feature",
                "geometry": c["poligono"],
                "properties": {
                    "cultivo_id": c["cultivo_id"],
                    "nombre": c["nombre"],
                    "especie": c["especie"],
                },
            }
            for c in (response.data or [])
        ]

        return {
            "type": "FeatureCollection",
            "features": features,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
