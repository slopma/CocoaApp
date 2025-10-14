from supaBaseClient import supabase
from sklearn.cluster import DBSCAN
import numpy as np
from shapely import MultiPolygon,Point
import uuid
import json
import pandas as pd
import geopandas as gpd
import random

def deactivate_old_records():
    #Desactiva cultivos y árboles antiguos (estado=True -> False).
    supabase.table("cultivo").update({"estado": False}).eq("estado", True).execute()
    supabase.table("arbol").update({"estado": False}).eq("estado", True).execute()

def get_lote_for_point(lotes, lon, lat):
    #Encuentra el lote al que pertenece un punto.
    point = Point(lon, lat)
    for lote in lotes:
        geom = MultiPolygon(lote["area"]["coordinates"])
        if geom.contains(point):
            return lote["lote_id"], lote["nombre"]
    return None

def insert_new_clusters(update_telemetry):
    #Obtener lotes activos
    lotes = supabase.table("lote").select("*").execute().data
    estados = supabase.table("estado_cacao").select("*").execute().data

    #Asignar lote_id a cada punto nuevo
    for d in update_telemetry:
        d["lote_id"], d["lote_nombre"] = get_lote_for_point(lotes, d["longitude"], d["latitude"])

    df = pd.DataFrame(update_telemetry)
    print("Datos procesados e inicializados")
    
    #Coordenadas
    coords = df[["longitude","latitude"]].values
    coords_rad = np.radians(coords)

    # Aplicar DBSCAN 
    db = DBSCAN(eps=0.025/6371, min_samples=1, metric="haversine").fit(coords_rad)
    labels = db.labels_

    print("DBSCAN completo")

    #Filtrar datos
    df["cluster"] = labels
    df_grouped = df.groupby("cluster").agg({
        "longitude": "mean",
        "latitude": "mean",
        "lote_id": "first",
        "lote_nombre": "first"
    })

    gdf = gpd.GeoDataFrame(
        df_grouped,
        geometry=gpd.points_from_xy(df_grouped["longitude"], df_grouped["latitude"]),
        crs="EPSG:4326"
    )

    #Proyectar en sistema distinto, crear el radio de 15m y volver a sistema lat/lon
    gdf = gdf.set_geometry(gdf.to_crs(3116).buffer(15).to_crs(4326))

    #Crear nuevos cultivos (uno por cluster)
    arboles_to_insert = []
    cultivos_to_insert = []
    for i, row in gdf.iterrows():
        if i == -1:
            continue  # ignorar ruido
        cluster_id = str(uuid.uuid4())
        cultivo = {
            "cultivo_id": cluster_id,
            "nombre": f"{row["lote_nombre"]} - Cultivo {i}",
            "especie": "Cacao",
            "lote_id": row["lote_id"],
            "estado": True,
            'poligono': {'type': 'MultiPolygon',
                'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
                'coordinates':[[[list(coord) for coord in np.array(row["geometry"].exterior.coords)]]]
            }
        }
        cultivos_to_insert.append(cultivo)

        arbol = {
            "arbol_id": str(uuid.uuid4()),
            "cultivo_id": cluster_id,
            "estado_cacao_id":estados[random.randint(0,len(estados)-1)]["estado_cacao_id"],
            "ubicacion": {
                'type': 'Point',
                'crs': {'type': 'name', 'properties': {'name': 'EPSG:4326'}},
                'coordinates': [row["geometry"].centroid.x, row["geometry"].centroid.y]
            },
            "nombre": f"Arbol {i}" if i != -1 else "Sin_cluster",
            "especie": "CH13",
            "estado": True,
        }
        arboles_to_insert.append(arbol)
        
    if cultivos_to_insert:
        print("Insertando cultivos")
        supabase.table("cultivo").insert(cultivos_to_insert).execute()

    if arboles_to_insert:
        print("Insertando arboles")
        supabase.table("arbol").insert(arboles_to_insert).execute()

    # Insertar las métricas nuevas
    metrics_to_insert = []
    for d in update_telemetry:
        metric = {
            "metric_id": str(uuid.uuid4()),
            "raw": d.get("raw"),
            "voltaje": d.get("voltaje"),
            "capacitancia": d.get("capacitancia"),
            "latitude": d.get("latitude"),
            "longitude": d.get("longitude"),
        }
        metrics_to_insert.append(metric)
    
    if metrics_to_insert:
        print("Insertando metrics")
        supabase.table("metrics").insert(metrics_to_insert).execute()

# ---------- MAIN ----------
def process_new_file(update_telemetry):
    """
    update_telemetry: lista de diccionarios con:
        {"longitude": ..., "latitude": ..., "voltaje": ..., "capacitancia": ..., "raw": ...}
    """
    deactivate_old_records()
    insert_new_clusters(update_telemetry)
    print("Base de datos actualizada con nuevos clusters y árboles.")

if __name__ == "__main__":
    # Supongamos que leemos un JSON con nuevas mediciones
    with open("metrics_file.json", "r") as f:
        new_data = json.load(f)

    process_new_file(new_data)
