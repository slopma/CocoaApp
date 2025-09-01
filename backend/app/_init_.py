import sys
import os

# Ajustar el path para poder importar app.*
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine, Base
from app.models import models  # importa todos los modelos


def init_db():
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✔ Tablas creadas exitosamente.")


if __name__ == "__main__":
    init_db()
