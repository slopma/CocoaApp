# backend/app/models/models.py
import uuid
from sqlalchemy import Column, String, Float, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db import Base

# -------- GEOPOINT (como objeto embebido) --------
class GeoPoint(Base):
    __tablename__ = "geopoint"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, default="Point")
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)


# -------- USUARIO --------
class Usuario(Base):
    __tablename__ = "usuario"

    usuario_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, nullable=False)
    creado_en = Column(TIMESTAMP, nullable=False)
    ultimo_acceso = Column(TIMESTAMP)

    # relaciones
    tokens = relationship("Token", back_populates="usuario")
    analisis = relationship("Analisis", back_populates="usuario")
    registros_geo = relationship("RegistroGeo", back_populates="usuario")


# -------- FINCA --------
class Finca(Base):
    __tablename__ = "finca"

    finca_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    municipio = Column(String, nullable=False)
    departamento = Column(String, nullable=False)
    propietario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"))
    creada_en = Column(TIMESTAMP, nullable=False)

    propietario = relationship("Usuario")
    cultivos = relationship("Cultivo", back_populates="finca")


# -------- CULTIVO --------
class Cultivo(Base):
    __tablename__ = "cultivo"

    cultivo_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    especie = Column(String, nullable=False)
    finca_id = Column(UUID(as_uuid=True), ForeignKey("finca.finca_id"))
    creado_en = Column(TIMESTAMP, nullable=False)

    finca = relationship("Finca", back_populates="cultivos")
    lotes = relationship("Lote", back_populates="cultivo")


# -------- LOTE --------
class Lote(Base):
    __tablename__ = "lote"

    lote_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    cultivo_id = Column(UUID(as_uuid=True), ForeignKey("cultivo.cultivo_id"))
    administrador_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"))
    creado_en = Column(TIMESTAMP, nullable=False)

    cultivo = relationship("Cultivo", back_populates="lotes")
    administrador = relationship("Usuario")
    analisis = relationship("Analisis", back_populates="lote")
    registros_geo = relationship("RegistroGeo", back_populates="lote")


# -------- SENSOR --------
class Sensor(Base):
    __tablename__ = "sensor"

    sensor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tipo = Column(String, nullable=False)
    pinza_id = Column(String, nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    analisis = relationship("Analisis", back_populates="sensor")


# -------- ANALISIS --------
class Analisis(Base):
    __tablename__ = "analisis"

    analisis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"))
    lote_id = Column(UUID(as_uuid=True), ForeignKey("lote.lote_id"))
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensor.sensor_id"))
    estado = Column(String, nullable=False)  # inmaduro, transicion, maduro, enfermo
    voltaje = Column(Float)
    nanofaradios = Column(Float)
    comentario = Column(String)
    foto_base64 = Column(Text)
    ubicacion_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.id"))
    registrado_en = Column(TIMESTAMP, nullable=False)

    usuario = relationship("Usuario", back_populates="analisis")
    lote = relationship("Lote", back_populates="analisis")
    sensor = relationship("Sensor", back_populates="analisis")
    ubicacion = relationship("GeoPoint")
    alertas = relationship("Alerta", back_populates="analisis")


# -------- REGISTRO GEO --------
class RegistroGeo(Base):
    __tablename__ = "registro_geo"

    registrogeo_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    geometry_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.id"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"))
    lote_id = Column(UUID(as_uuid=True), ForeignKey("lote.lote_id"))
    registrado_en = Column(TIMESTAMP, nullable=False)

    geometry = relationship("GeoPoint")
    usuario = relationship("Usuario", back_populates="registros_geo")
    lote = relationship("Lote", back_populates="registros_geo")


# -------- ALERTA --------
class Alerta(Base):
    __tablename__ = "alerta"

    alerta_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analisis_id = Column(UUID(as_uuid=True), ForeignKey("analisis.analisis_id"))
    estado = Column(String, nullable=False)
    descripcion = Column(String)
    nivel = Column(String)  # Bajo | Medio | Alto
    creada_en = Column(TIMESTAMP, nullable=False)

    analisis = relationship("Analisis", back_populates="alertas")


# -------- TOKEN --------
class Token(Base):
    __tablename__ = "token"

    token_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expira_en = Column(TIMESTAMP, nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"))

    usuario = relationship("Usuario", back_populates="tokens")
