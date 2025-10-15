from fastapi import APIRouter, HTTPException
from src.db import supabase
from typing import Dict, Any, List
import json

router = APIRouter()

@router.get("/")
def get_zone_analysis():
    """
    Análisis de zonas con datos GeoJSON y generación de notificaciones
    """
    try:
        # Obtener árboles activos con frutos usando RPC
        arboles_response = supabase.rpc("get_arboles_with_frutos").execute()
        
        if hasattr(arboles_response, 'error') and arboles_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener árboles: {arboles_response.error}")
        
        arboles_data = arboles_response.data or []

        # Obtener cultivos activos
        cultivos_response = supabase.table("cultivo").select("""
            cultivo_id,
            nombre,
            poligono,
            lote_id,
            lote:lote_id (
                lote_id,
                nombre,
                finca_id,
                finca:finca_id (
                    finca_id,
                    nombre
                )
            )
        """).eq("estado", True).execute()

        if hasattr(cultivos_response, 'error') and cultivos_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener cultivos: {cultivos_response.error}")

        cultivos_data = cultivos_response.data or []

        # Obtener estados de cacao
        estados_response = supabase.table("estado_cacao").select("estado_cacao_id, nombre").execute()
        if hasattr(estados_response, 'error') and estados_response.error:
            raise HTTPException(status_code=500, detail=f"Error al obtener estados: {estados_response.error}")
        
        estados = {e["estado_cacao_id"]: e["nombre"] for e in estados_response.data or []}

        # Crear GeoJSON para árboles con frutos
        arbol_features = []
        for arbol in arboles_data:
            if arbol.get("ubicacion"):
                feature = {
                    "type": "Feature",
                    "properties": {
                        "arbol_id": str(arbol["arbol_id"]),
                        "nombre": arbol.get("nombre", ""),
                        "estado_arbol": estados.get(arbol.get("estado_arbol"), "Desconocido"),
                        "tipo": "arbol",
                        "frutos": arbol.get("frutos", []),
                        "cultivo_id": str(arbol.get("cultivo_id", "")),
                    },
                    "geometry": arbol["ubicacion"]
                }
                arbol_features.append(feature)

        # Crear GeoJSON para cultivos
        cultivo_features = []
        for cultivo in cultivos_data:
            if cultivo.get("poligono"):
                feature = {
                    "type": "Feature",
                    "properties": {
                        "cultivo_id": str(cultivo["cultivo_id"]),
                        "nombre": cultivo.get("nombre", ""),
                        "tipo": "cultivo",
                        "lote": cultivo.get("lote", {}),
                    },
                    "geometry": cultivo["poligono"]
                }
                cultivo_features.append(feature)

        # Combinar todas las features
        all_features = arbol_features + cultivo_features
        geojson = {
            "type": "FeatureCollection",
            "features": all_features
        }

        # Calcular estadísticas básicas
        stats = {
            "total_arboles": len(arbol_features),
            "total_cultivos": len(cultivo_features),
            "total_features": len(all_features)
        }

        # Generar notificaciones automáticas
        notifications = generate_automatic_notifications(stats)

        return {
            "geojson": geojson,
            "stats": stats,
            "notifications": notifications
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en análisis de zonas: {str(e)}")

def generate_automatic_notifications(stats: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Genera notificaciones automáticas basadas en estadísticas
    """
    notifications = []

    # Notificación de bienvenida si es la primera carga
    if stats["total_arboles"] > 0:
        notifications.append({
            "type": "info",
            "title": "Sistema Iniciado",
            "message": f"Sistema cargado con {stats['total_arboles']} arboles y {stats['total_cultivos']} cultivos",
            "duration": 5000
        })

    # Notificación si no hay datos
    if stats["total_arboles"] == 0:
        notifications.append({
            "type": "warning",
            "title": "Sin Datos",
            "message": "No se encontraron arboles activos en el sistema",
            "duration": 8000
        })

    return notifications
