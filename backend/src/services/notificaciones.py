from fastapi import APIRouter, HTTPException
from db import supabase
from starlette.concurrency import run_in_threadpool

router = APIRouter()

@router.get("/")
async def get_notifications():
    """Obtiene todas las notificaciones"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notifications").select("*").execute()
        )
        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_notification(notification: dict):
    """Crea una nueva notificación"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notifications").insert(notification).execute()
        )
        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{notif_id}/read")
async def mark_as_read(notif_id: str):
    """Marca una notificación como leída"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notifications")
            .update({"read": True})
            .eq("id", notif_id)
            .execute()
        )
        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data[0] if response.data else {"id": notif_id, "read": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{notif_id}")
async def delete_notification(notif_id: str):
    """Elimina una notificación"""
    try:
        response = await run_in_threadpool(
            lambda: supabase.table("notifications").delete().eq("id", notif_id).execute()
        )
        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {"deleted": notif_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
