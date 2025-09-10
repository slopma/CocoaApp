import uuid
from backend.app.models.models import EstadoCacao, EstadoAlerta, Rol
from backend.app.db import SessionLocal



# Datos iniciales
estados_cacao = [
    {"nombre": "Inmaduro", "descripcion": "El fruto aún no está listo para cosecha"},
    {"nombre": "Transición", "descripcion": "Fruto en proceso de maduración"},
    {"nombre": "Maduro", "descripcion": "Fruto listo para cosecha"},
    {"nombre": "Enfermo", "descripcion": "Fruto afectado por enfermedad"},
]

estados_alerta = [
    {"nombre": "Bajo", "descripcion": "Condición estable, sin riesgos significativos"},
    {"nombre": "Medio", "descripcion": "Condición intermedia, se requiere seguimiento"},
    {"nombre": "Alto", "descripcion": "Condición crítica, requiere atención inmediata"},
]

roles = [
    {"nombre": "Cacaocultor", "descripcion": "Usuario que administra y gestiona sus propios cultivos y lotes"},
    {"nombre": "Investigador", "descripcion": "Usuario encargado de análisis y estudios de los cultivos"},
    {"nombre": "Administrador", "descripcion": "Usuario con privilegios de gestión global en el sistema"},
]

tipos_usuario = [
    {"nombre": "Persona", "descripcion": "Usuario individual"},
    {"nombre": "Empresa", "descripcion": "Usuario empresarial"},
]


def seed_data():
    db = SessionLocal()
    try:
        # Estados de cacao
        for e in estados_cacao:
            if not db.query(EstadoCacao).filter_by(nombre=e["nombre"]).first():
                db.add(EstadoCacao(**e))

        # Estados de alerta
        for e in estados_alerta:
            if not db.query(EstadoAlerta).filter_by(nombre=e["nombre"]).first():
                db.add(EstadoAlerta(**e))

        # Roles
        for r in roles:
            if not db.query(Rol).filter_by(nombre=r["nombre"]).first():
                db.add(Rol(**r))
        

        db.commit()
        print("✅ Datos iniciales insertados correctamente")
    except Exception as e:
        db.rollback()
        print("❌ Error insertando datos:", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
