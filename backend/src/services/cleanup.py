from fastapi import APIRouter, HTTPException
from src.db import supabase
from typing import Dict, Any

router = APIRouter()

@router.delete("/duplicates")
def cleanup_duplicates():
    """
    Limpia elementos duplicados creados por el clustering
    """
    try:
        # 1. Buscar árboles con nombre "Arbol 0"
        arboles_response = supabase.table("arbol").select("arbol_id, cultivo_id, nombre").eq("nombre", "Arbol 0").execute()
        
        if hasattr(arboles_response, 'error') and arboles_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener árboles: {arboles_response.error}")
        
        arboles_0 = arboles_response.data or []
        
        # 2. Buscar cultivos con nombre que termine en "Cultivo 0"
        cultivos_response = supabase.table("cultivo").select("cultivo_id, nombre").ilike("nombre", "%Cultivo 0").execute()
        
        if hasattr(cultivos_response, 'error') and cultivos_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener cultivos: {cultivos_response.error}")
        
        cultivos_0 = cultivos_response.data or []
        
        # 3. Eliminar árboles "Arbol 0"
        deleted_arboles = 0
        if arboles_0:
            delete_arboles_response = supabase.table("arbol").delete().eq("nombre", "Arbol 0").execute()
            if hasattr(delete_arboles_response, 'error') and delete_arboles_response.error:
                raise HTTPException(status_code=500, detail=f"Error al eliminar árboles: {delete_arboles_response.error}")
            deleted_arboles = len(arboles_0)
        
        # 4. Eliminar cultivos "Cultivo 0"
        deleted_cultivos = 0
        if cultivos_0:
            delete_cultivos_response = supabase.table("cultivo").delete().ilike("nombre", "%Cultivo 0").execute()
            if hasattr(delete_cultivos_response, 'error') and delete_cultivos_response.error:
                raise HTTPException(status_code=500, detail=f"Error al eliminar cultivos: {delete_cultivos_response.error}")
            deleted_cultivos = len(cultivos_0)
        
        return {
            "status": "success",
            "message": "Limpieza completada",
            "deleted_arboles": deleted_arboles,
            "deleted_cultivos": deleted_cultivos,
            "arboles_found": [{"arbol_id": a["arbol_id"], "cultivo_id": a["cultivo_id"], "nombre": a["nombre"]} for a in arboles_0],
            "cultivos_found": [{"cultivo_id": c["cultivo_id"], "nombre": c["nombre"]} for c in cultivos_0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en limpieza: {str(e)}")

@router.get("/duplicates")
def list_duplicates():
    """
    Lista elementos duplicados sin eliminarlos
    """
    try:
        # Buscar árboles con nombre "Arbol 0"
        arboles_response = supabase.table("arbol").select("arbol_id, cultivo_id, nombre, ubicacion").eq("nombre", "Arbol 0").execute()
        
        if hasattr(arboles_response, 'error') and arboles_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener árboles: {arboles_response.error}")
        
        arboles_0 = arboles_response.data or []
        
        # Buscar cultivos con nombre que termine en "Cultivo 0"
        cultivos_response = supabase.table("cultivo").select("cultivo_id, nombre, lote_id").ilike("nombre", "%Cultivo 0").execute()
        
        if hasattr(cultivos_response, 'error') and cultivos_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener cultivos: {cultivos_response.error}")
        
        cultivos_0 = cultivos_response.data or []
        
        return {
            "arboles_0": arboles_0,
            "cultivos_0": cultivos_0,
            "count_arboles": len(arboles_0),
            "count_cultivos": len(cultivos_0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar duplicados: {str(e)}")
