from fastapi import FastAPI
from services import users, metrics, arboles, cultivos

app = FastAPI(title="My App API")

# Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
app.include_router(arboles.router, prefix="/arboles", tags=["Árboles"])
app.include_router(cultivos.router, prefix="/cultivos", tags=["Cultivos"])
app.include_router(lotes.router, prefix="/lotes", tags=["Lotes"])

@app.get("/")
def root():
    return {"message": "Backend running 🚀"}
