# backend/app/models/models.py
import uuid
import os
from sqlalchemy import (
    JSON, Column, String, Float, Text, TIMESTAMP, ForeignKey, Enum, Table, Boolean,
    func, LargeBinary
)
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..db import Base

# IMPORTANT: Store your encryption key securely, for example, in an environment variable.
# Do not hardcode it in your application.
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", "your-default-secret-key")

class EncryptedString(TypeDecorator):
    """A custom type to store encrypted strings using pgcrypto."""
    impl = LargeBinary

    def __init__(self, key, *args, **kwargs):
        super(EncryptedString, self).__init__(*args, **kwargs)
        self.key = key

    def bind_expression(self, bindvalue):
        # Encrypt the value on the way in
        return func.pgp_sym_encrypt(bindvalue, self.key)

    def column_expression(self, col):
        # Decrypt the value on the way out
        return func.pgp_sym_decrypt(col, self.key)

    def bind_processor(self, dialect):
        def process(value):
            return value
        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                return value.decode('utf-8')
            return value
        return process

finca_cacaocultor = Table(
    "finca_cacaocultor",
    Base.metadata,
    Column("finca_id", UUID(as_uuid=True), ForeignKey("finca.finca_id"), primary_key=True),
    Column("usuario_id", UUID(as_uuid=True), ForeignKey("usuario.usuario_id"), primary_key=True),
    Column("activo", Boolean, default=True, nullable=False)  # opcional: marcar si está activo
)

# -------- USUARIO --------
class Usuario(Base):
    __tablename__ = "usuario"

    usuario_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(EncryptedString(ENCRYPTION_KEY), nullable=False)
    rol_id = Column(UUID(as_uuid=True), ForeignKey("rol_usuario.rol_id"), nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)
    ultimo_acceso = Column(TIMESTAMP)
    
    
    
    tokens = relationship("Token", back_populates="usuario")
    analisis = relationship("Analisis", back_populates="usuario")
    lotes = relationship("Lote", back_populates="cacaocultor")
    fincas_administradas = relationship("Finca", back_populates="administrador")
    rol = relationship("Rol", back_populates="usuarios")
    fincas = relationship("Finca", secondary=finca_cacaocultor, back_populates="cacaocultores")


class Rol(Base):
    __tablename__ = "rol_usuario"

    rol_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, unique=True, nullable=False)  # Cacaocultor, Investigador, Administrador
    descripcion = Column(String, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")



# -------- FINCA --------
class Finca(Base):
    __tablename__ = "finca"

    finca_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String,nullable=False)
    localidad = Column(String, nullable=False)
    departamento = Column(String, nullable=False)
    pais = Column(String, nullable=False)
    administrador_id = Column(UUID(as_uuid=True),ForeignKey("usuario.usuario_id"), nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    administrador = relationship("Usuario", back_populates="fincas_administradas")
    lotes = relationship("Lote", back_populates="finca")   # ahora finca → lotes
    geojson_finca = relationship("GeoJsonFinca", back_populates="finca", uselist=False)
    cacaocultores = relationship("Usuario", secondary=finca_cacaocultor, back_populates="fincas")






# -------- CULTIVO --------


class Cultivo(Base):
    __tablename__ = "cultivo"

    cultivo_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)   # ej: Cacao, Mango
    especie = Column(String, nullable=False)
    lote_id = Column(UUID(as_uuid=True), ForeignKey("lote.lote_id"), nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    lote = relationship("Lote", back_populates="cultivos")
    geojson_features = relationship("GeoJsonFeature", back_populates="cultivo")


# -------- LOTE --------
   

class Lote(Base):
    __tablename__ = "lote"

    lote_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    finca_id = Column(UUID(as_uuid=True), ForeignKey("finca.finca_id"), nullable=False)
    cacaocultor_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"), nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    finca = relationship("Finca", back_populates="lotes")
    cacaocultor = relationship("Usuario", back_populates="lotes")
    analisis = relationship("Analisis", back_populates="lote")
    geojson_features = relationship("GeoJsonFeature", back_populates="lote")
    cultivos = relationship("Cultivo", back_populates="lote")  # ahora un lote tiene varios cultivos




# -------- SENSOR --------
class Sensor(Base):
    __tablename__ = "sensor"

    sensor_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registrado_en = Column(TIMESTAMP, nullable=False)

    analisis = relationship("Analisis", back_populates="sensor")

class EstadoCacao(Base):
    __tablename__ = "estado_cacao"

    estado_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, unique=True, nullable=False)  # inmaduro, transicion, maduro, enfermo
    descripcion = Column(String, nullable=False)

    analisis = relationship("Analisis", back_populates="estado_cacao")
    alertas = relationship("Alerta", back_populates="estado_cacao")


# -------- ANALISIS --------
class Analisis(Base):
    __tablename__ = "analisis"

    analisis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"), nullable=False)
    lote_id = Column(UUID(as_uuid=True), ForeignKey("lote.lote_id"), nullable=False)
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensor.sensor_id"), nullable=False)
    estado_id = Column(UUID(as_uuid=True), ForeignKey("estado_cacao.estado_id"), nullable=False)
    voltaje = Column(Float, nullable=False)
    nanofaradios = Column(Float, nullable=False)
    comentario = Column(String, nullable=False)
    foto_base64 = Column(Text, nullable=False) ########
    geopoint_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.geopoint_id"), nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    usuario = relationship("Usuario", back_populates="analisis")
    lote = relationship("Lote", back_populates="analisis")
    sensor = relationship("Sensor", back_populates="analisis")
    geopoint = relationship("GeoPoint")
    alertas = relationship("Alerta", back_populates="analisis")
    estado_cacao = relationship("EstadoCacao", back_populates="analisis")



# -------- ALERTA --------
class Alerta(Base):
    __tablename__ = "alerta"

    alerta_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analisis_id = Column(UUID(as_uuid=True), ForeignKey("analisis.analisis_id"), nullable=False)
    estado_cacao_id = Column(UUID(as_uuid=True), ForeignKey("estado_cacao.estado_id"), nullable=False)
    descripcion = Column(String, nullable=False)
    estado_alerta_id = Column(UUID(as_uuid=True), ForeignKey("estado_alerta.estado_id"), nullable=False)  # Bajo | Medio | Alto
    registrado_en = Column(TIMESTAMP, nullable=False)

    analisis = relationship("Analisis", back_populates="alertas")
    estado_alerta = relationship("EstadoAlerta", back_populates="alertas")
    estado_cacao = relationship("EstadoCacao", back_populates="alertas")


class EstadoAlerta(Base):
    __tablename__ = "estado_alerta"

    estado_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, unique=True, nullable=False)  # # Bajo | Medio | Alto
    descripcion = Column(String, nullable=False)

    alertas = relationship("Alerta", back_populates="estado_alerta")


# -------- TOKEN --------
class Token(Base):
    __tablename__ = "token"

    token_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expira_en = Column(TIMESTAMP, nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuario.usuario_id"), nullable=False)

    usuario = relationship("Usuario", back_populates="tokens")

class GeoJsonFinca(Base):
    __tablename__ = "geojson_finca"

    geojson_finca_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    finca_id = Column(UUID(as_uuid=True), ForeignKey("finca.finca_id"), nullable=False)
    data = Column(JSON, nullable=False)  # GeoJSON completo
    registrado_en = Column(TIMESTAMP, nullable=False)

    finca = relationship("Finca", back_populates="geojson_finca")
    features = relationship("GeoJsonFeature", back_populates="geojson_finca")
    feeds = relationship("FeedMetrics", back_populates="finca_geojson")


class GeoJsonFeature(Base):
    __tablename__ = "geojson_feature"

    feature_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    geojson_finca_id = Column(UUID(as_uuid=True), ForeignKey("geojson_finca.geojson_finca_id"), nullable=True)
    tipo = Column(Enum("cultivo", "lote", name="feature_tipo"), nullable=False)
    nombre = Column(String, nullable=False)  # ej: "Cacao Lote 1"
    cultivo_id = Column(UUID(as_uuid=True), ForeignKey("cultivo.cultivo_id"), nullable=True)
    lote_id = Column(UUID(as_uuid=True), ForeignKey("lote.lote_id"), nullable=False)
    data = Column(JSON, nullable=False)  # sub-geojson del feature
    shape_type = Column(Enum("Polygon", "MultiPolygon", "Point", name="feature_shape"), nullable=False)  # Polygon, MultiPolygon, Point, etc.
    registrado_en = Column(TIMESTAMP, nullable=False)

    geojson_finca = relationship("GeoJsonFinca", back_populates="features")
    cultivo = relationship("Cultivo", back_populates="geojson_features")
    lote = relationship("Lote", back_populates="geojson_features")
    
    


# -------- GEOPOINT (como objeto embebido) --------
class GeoPoint(Base):
    __tablename__ = "geopoint"

    geopoint_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, default="Point")
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    
    raw_metrics = relationship("RawMetrics", back_populates="geopoint")
    capacitancia_metrics = relationship("CapacitanciaMetrics", back_populates="geopoint")
    voltaje_metrics = relationship("VoltajeMetrics", back_populates="geopoint")

class FeedMetrics(Base):
    __tablename__ = "feed_metrics"

    feed_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    geojson_finca_id = Column(UUID(as_uuid=True), ForeignKey("geojson_finca.geojson_finca_id"), nullable=False)
    data = Column(JSON, nullable=False)  # métricas generales (ej: promedio, resumen)
    registrado_en = Column(TIMESTAMP, nullable=False)

    finca_geojson = relationship("GeoJsonFinca", back_populates="feeds")
    raw = relationship("RawMetrics", back_populates="feed")
    capacitancia = relationship("CapacitanciaMetrics", back_populates="feed")
    voltaje = relationship("VoltajeMetrics", back_populates="feed")


class RawMetrics(Base):
    __tablename__ = "raw_metrics"

    raw_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feed_id = Column(UUID(as_uuid=True), ForeignKey("feed_metrics.feed_id"), nullable=False)
    geopoint_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.geopoint_id"), nullable=False)
    data = Column(JSON, nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    feed = relationship("FeedMetrics", back_populates="raw")
    geopoint = relationship("GeoPoint", back_populates="raw_metrics")



class CapacitanciaMetrics(Base):
    __tablename__ = "capacitancia_metrics"

    cap_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feed_id = Column(UUID(as_uuid=True), ForeignKey("feed_metrics.feed_id"), nullable=False)
    geopoint_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.geopoint_id"), nullable=False)
    data = Column(JSON, nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    feed = relationship("FeedMetrics", back_populates="capacitancia")
    geopoint = relationship("GeoPoint", back_populates="capacitancia_metrics")


class VoltajeMetrics(Base):
    __tablename__ = "voltaje_metrics"

    volt_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feed_id = Column(UUID(as_uuid=True), ForeignKey("feed_metrics.feed_id"), nullable=False)
    geopoint_id = Column(UUID(as_uuid=True), ForeignKey("geopoint.geopoint_id"),nullable=False)
    data = Column(JSON, nullable=False)
    registrado_en = Column(TIMESTAMP, nullable=False)

    feed = relationship("FeedMetrics", back_populates="voltaje")
    geopoint = relationship("GeoPoint", back_populates="voltaje_metrics")
