# backend/app/generate_er.py
from sqlalchemy import create_engine
from sqlalchemy_schemadisplay import create_schema_graph
from .db import Base
from .models import models  # importa tus modelos para que se registren en Base

# 🚀 Crear un engine temporal en memoria (NO conecta a Azure)
dummy_engine = create_engine("sqlite:///:memory:")

graph = create_schema_graph(
    metadata=Base.metadata,
    engine=dummy_engine,
    show_datatypes=True,
    show_indexes=True,
    rankdir="LR",
    concentrate=False
)

# Guardar como DOT
with open("modelo.dot", "w") as f:
    f.write(graph.to_string())

# También puedes exportar directamente a PNG si tienes Graphviz instalado:
# graph.write_png("modelo.png")

print("✔ Archivo modelo.dot generado. Ábrelo en https://dreampuf.github.io/GraphvizOnline/")
