from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

# Crear engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL queries en modo DEBUG
    pool_pre_ping=True,  # Verificar conexión antes de usarla
)

# Crear sesión
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base para todos los modelos
Base = declarative_base()

def get_db():
    """Dependencia para inyectar sesión de BD en rutas"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Crear todas las tablas"""
    Base.metadata.create_all(bind=engine)