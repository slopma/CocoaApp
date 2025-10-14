from fastapi import FastAPI
from services import users, metrics, arboles, cultivos, lotes, update_clusters

app = FastAPI(title="My App API")

# Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
app.include_router(arboles.router, prefix="/arboles", tags=["Árboles"])
app.include_router(cultivos.router, prefix="/cultivos", tags=["Cultivos"])
app.include_router(lotes.router, prefix="/lotes", tags=["Lotes"])
app.include_router(update_clusters.router, prefix="/update_clusters", tags=["Clustering"])

@app.get("/")
def root():
    return {"message": "Backend running"}
