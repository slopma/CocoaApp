from fastapi import FastAPI
from routers import users, metrics


app = FastAPI(title="My App API")

# Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])

@app.get("/")
def root():
    return {"message": "Backend running 🚀"}
