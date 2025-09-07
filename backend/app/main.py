from fastapi import FastAPI
from routers import users, metrics
import json

app = FastAPI(title="My App API")

# Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])

@app.get("/")
def root():
    return {"message": "Backend running 🚀"}

@app.get("/mapa")
def mapa():
    with open("files/lotes.geojson","r") as f:
        mapa = json.load(f)

    return mapa

@app.get("/mediciones")
def mapa():
    with open("files/readings.geojson","r") as f:
        mediciones = json.load(f)
        
    return mediciones
