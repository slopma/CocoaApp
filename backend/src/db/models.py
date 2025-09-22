from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID

# ---------- Cultivo ----------
class Cultivo(BaseModel):
    cultivo_id: UUID
    lote_id: UUID
    nombre: str
    especie: str
    poligono: Dict[str, Any]  # GeoJSON

# ---------- Estado cacao ----------
class EstadoCacao(BaseModel):
    estado_cacao_id: UUID
    nombre: str

# ---------- Fruto ----------
class Fruto(BaseModel):
    fruto_id: UUID
    estado_cacao_id: UUID
    especie: Optional[str]

# ---------- Árbol ----------
class Arbol(BaseModel):
    arbol_id: UUID
    cultivo_id: UUID
    nombre: Optional[str]
    especie: Optional[str]
    ubicacion: Optional[Dict[str, Any]]  # GeoJSON Point
    estado_cacao_id: UUID
    frutos: List[Fruto] = []
