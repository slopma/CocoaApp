from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services import arboles, cultivos, lotes, update_clusters, notificaciones, stats, zone_analysis, cleanup

app = FastAPI(title="CocoaApp API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://54.227.24.240",
        "http://localhost:5173",
        "http://localhost:3000",
        "*",  # solo para pruebas
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(arboles.router, prefix="/arboles", tags=["Árboles"])
app.include_router(cultivos.router, prefix="/cultivos", tags=["Cultivos"])
app.include_router(lotes.router, prefix="/lotes", tags=["Lotes"])
app.include_router(update_clusters.router, prefix="/update_clusters", tags=["Clustering"])
app.include_router(notificaciones.router, prefix="/notifications", tags=["Notificaciones"])
app.include_router(stats.router, prefix="/stats", tags=["Estadísticas"])
app.include_router(zone_analysis.router, prefix="/zone-analysis", tags=["Análisis de Zonas"])
app.include_router(cleanup.router, prefix="/cleanup", tags=["Limpieza"])

@app.get("/")
def root():
    return {"message": "CocoaApp Backend running"}
