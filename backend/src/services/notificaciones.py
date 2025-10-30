from fastapi import APIRouter, HTTPException
from src.db import supabase
from starlette.concurrency import run_in_threadpool
from datetime import datetime

router = APIRouter()


@router.get("/") 
async def get_notifications():
    """Obtiene todas las notificaciones"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion").select("notificacion_id, usuario_id, alerta_id, titulo, mensaje, leida, created_at").execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        # Transformar los datos para que coincidan con el formato esperado por el frontend
        notifications = []
        if response.data:
            for notif in response.data:
                notifications.append({
                    "id": notif["notificacion_id"],
                    "title": notif["titulo"],
                    "message": notif["mensaje"] or notif["titulo"],  # Usar mensaje o título como fallback
                    "type": "info",
                    "timestamp": notif["created_at"],
                    "read": notif["leida"]
                })
        
        return notifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_notification(notification: dict):
    """Crea una nueva notificación"""
    try:
        # Adaptar los datos al esquema de la tabla notificacion
        notificacion_data = {
            "titulo": notification.get("title", "Nueva notificación"),
            "mensaje": notification.get("message", ""),
            "usuario_id": notification.get("usuario_id", "00000000-0000-0000-0000-000000000000"),  # UUID por defecto
            "alerta_id": notification.get("alerta_id", "00000000-0000-0000-0000-000000000000"),   # UUID por defecto
            "leida": False
        }
        
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion").insert(notificacion_data).execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data[0] if response.data else notificacion_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/")
async def create_test_notification():
    """Crea una notificación de prueba"""
    # Primero, obtener un usuario existente de la base de datos
    try:
        usuarios_response = await run_in_threadpool(
            lambda: supabase.table("usuario").select("usuario_id").limit(1).execute()
        )
        if hasattr(usuarios_response, 'error') and usuarios_response.error:
            # Si no hay usuarios, crear notificación sin usuario_id
            test_notification = {
                "titulo": "Sistema cargado correctamente",
                "mensaje": "Se han procesado 15 árboles exitosamente en el sistema",
                "leida": False
            }
        else:
            usuario_id = usuarios_response.data[0]["usuario_id"] if usuarios_response.data else None
            test_notification = {
                "titulo": "Sistema cargado correctamente",
                "mensaje": "Se han procesado 15 árboles exitosamente en el sistema",
                "usuario_id": usuario_id,
                "alerta_id": None,  # Permitir NULL para alerta_id
                "leida": False
            }
        
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion").insert(test_notification).execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {"message": "Notificación de prueba creada", "data": response.data[0] if response.data else test_notification}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{notif_id}/read/")
async def mark_as_read(notif_id: str):
    """Marca una notificación como leída"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion")
            .update({"leida": True})
            .eq("notificacion_id", notif_id)
            .execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {"id": notif_id, "read": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/mark-all-read/")
async def mark_all_as_read():
    """Marca todas las notificaciones como leídas"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion")
            .update({"leida": True})
            .eq("leida", False)
            .execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {"message": "Todas las notificaciones marcadas como leídas"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{notif_id}/")
async def delete_notification(notif_id: str):
    """Elimina una notificación"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notificacion").delete().eq("notificacion_id", notif_id).execute()
        )
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {"deleted": notif_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
