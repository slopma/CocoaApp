from fastapi import APIRouter

router = APIRouter()

# Ejemplo de endpoint
@router.get("/")
async def get_users():
	return {"message": "Lista de usuarios"}
