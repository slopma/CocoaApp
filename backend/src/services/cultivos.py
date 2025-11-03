from fastapi import APIRouter, HTTPException
from src.db import supabase

router = APIRouter()


@router.get("")
async def get_cultivos_no_slash():
    return await get_cultivos()

@router.get("/") 
async def get_cultivos():
    """Obtiene todos los cultivos en formato GeoJSON, mapeando lote_id a zonas con polígono"""
    try:
        from starlette.concurrency import run_in_threadpool
        import re
        
        # 1. Obtener cultivos
        response = supabase.table("cultivo").select("cultivo_id, nombre, especie, lote_id, poligono").eq("estado", True).execute()
        if hasattr(response, 'error') and response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        cultivos_data = response.data or []
        print(f"✅ Cultivos obtenidos: {len(cultivos_data)}")
        
        # 2. Obtener todas las zonas con polígono (zonas verdes)
        lotes_response = await run_in_threadpool(
            lambda: supabase.table("lote")
            .select("lote_id, nombre")
            .not_.is_("poligono", None)
            .execute()
        )
        lotes_con_poligono = lotes_response.data or []
        
        # 3. Crear mapa nombre -> lote_id (variantes: "Lote N" y "Zona N")
        nombre_a_lote_id = {}
        for lote in lotes_con_poligono:
            nombre = lote.get("nombre", "")
            lote_id = lote.get("lote_id")
            if nombre and lote_id:
                # Mapear variantes del nombre
                variantes = {
                    nombre,
                    re.sub(r"^Zona\s+", "Lote ", nombre),
                    re.sub(r"^Lote\s+", "Zona ", nombre),
                }
                for v in variantes:
                    if v and v not in nombre_a_lote_id:
                        nombre_a_lote_id[v] = lote_id
        
        # 4. Mapear cultivos a zonas correctas basándose en el nombre
        features = []
        for c in cultivos_data:
            if not c.get("poligono"):
                continue
                
            # Extraer prefijo del nombre del cultivo (ej: "Lote 3" de "Lote 3 - Cultivo C3")
            nombre_cultivo = c.get("nombre", "")
            prefijo_lote = re.sub(r"\s+-\s+.*$", "", nombre_cultivo).strip()
            
            # Buscar zona correspondiente por nombre
            lote_id_mapeado = nombre_a_lote_id.get(prefijo_lote) or nombre_a_lote_id.get(re.sub(r"^Lote\s+", "Zona ", prefijo_lote)) or nombre_a_lote_id.get(re.sub(r"^Zona\s+", "Lote ", prefijo_lote))
            
            # Si no encontramos mapeo, usar el lote_id original del cultivo
            lote_id_final = lote_id_mapeado or c.get("lote_id")
            
            features.append({
                "type": "Feature",
                "geometry": c.get("poligono"),
                "properties": {
                    "cultivo_id": c["cultivo_id"],
                    "nombre": c["nombre"],
                    "especie": c.get("especie", "Cacao"),
                    "lote_id": lote_id_final,  # Usar lote_id mapeado a zona con polígono
                },
            })
        
        print(f"✅ Cultivos mapeados a zonas: {len(features)}")

        return {
            "type": "FeatureCollection",
            "features": features,
        }

    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"❌ Error en get_cultivos: {error_detail}")
        raise HTTPException(status_code=500, detail=str(e))
