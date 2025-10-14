from fastapi import APIRouter, HTTPException
from utils.cluster import process_new_file
from db.models import Metrics
from typing import List

router = APIRouter()

# Routers
@router.post("/")
def update(metrics:List[Metrics]):
    try:
        metrics_list = [m.model_dump() for m in metrics]

        # Procesar clustering e inserción
        process_new_file(metrics_list)

        return {"status": "ok", "count": len(metrics_list), "message": "Base de datos actualizada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))