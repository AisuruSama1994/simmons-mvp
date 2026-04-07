"""
seed_data.py
------------
Datos iniciales que se insertan UNA SOLA VEZ al arrancar la app.
Llamar desde main.py en el evento startup, después de create_all().

Uso:
    from seed_data import seed_initial_data
    seed_initial_data(db)
"""

from sqlalchemy.orm import Session
from models_base import Configuracion, Rol, Sucursal
from models_materia_prima import UnidadMedida, ConversionUnidades


def seed_initial_data(db: Session) -> None:
    _seed_roles(db)
    _seed_sucursal_principal(db)
    _seed_unidades_medida(db)
    _seed_conversiones(db)
    _seed_configuracion(db)
    db.commit()


# ── Roles ──────────────────────────────────────────────────────────────────

def _seed_roles(db: Session) -> None:
    roles = [
        {"nombre": "admin",    "descripcion": "Administrador del sistema"},
        {"nombre": "gerente",  "descripcion": "Gerente de la panadería"},
        {"nombre": "panadero", "descripcion": "Encargado de producción"},
        {"nombre": "barista",  "descripcion": "Atención al público / barra"},
        {"nombre": "cajero",   "descripcion": "Caja y ventas"},
    ]
    for r in roles:
        from models_base import Rol
        if not db.query(Rol).filter_by(nombre=r["nombre"]).first():
            db.add(Rol(**r))


# ── Sucursal principal ──────────────────────────────────────────────────────

def _seed_sucursal_principal(db: Session) -> None:
    if not db.query(Sucursal).first():
        db.add(Sucursal(nombre="Casa Central", activo=True))


# ── Unidades de medida ──────────────────────────────────────────────────────

def _seed_unidades_medida(db: Session) -> None:
    unidades = [
        # Peso
        {"nombre": "Gramo",      "abreviacion": "g",   "tipo": "peso"},
        {"nombre": "Kilogramo",  "abreviacion": "kg",  "tipo": "peso"},
        # Volumen
        {"nombre": "Mililitro",  "abreviacion": "ml",  "tipo": "volumen"},
        {"nombre": "Litro",      "abreviacion": "l",   "tipo": "volumen"},
        {"nombre": "Centímetro cúbico", "abreviacion": "cm³", "tipo": "volumen"},
        # Cantidad
        {"nombre": "Unidad",     "abreviacion": "u",   "tipo": "cantidad"},
    ]
    for u in unidades:
        if not db.query(UnidadMedida).filter_by(abreviacion=u["abreviacion"]).first():
            db.add(UnidadMedida(**u))
    db.flush()  # para que los IDs estén disponibles al crear conversiones


# ── Conversiones ────────────────────────────────────────────────────────────

def _seed_conversiones(db: Session) -> None:
    def get(abrev: str) -> UnidadMedida:
        return db.query(UnidadMedida).filter_by(abreviacion=abrev).first()

    conversiones = [
        # Peso
        ("kg",  "g",   1000),
        ("g",   "kg",  0.001),
        # Volumen
        ("l",   "ml",  1000),
        ("ml",  "l",   0.001),
        ("cm³", "ml",  1),      # cm³ ≡ ml
        ("ml",  "cm³", 1),
        ("l",   "cm³", 1000),
        ("cm³", "l",   0.001),
    ]
    for origen_abrev, destino_abrev, factor in conversiones:
        origen = get(origen_abrev)
        destino = get(destino_abrev)
        if origen and destino:
            existe = db.query(ConversionUnidades).filter_by(
                unidad_origen_id=origen.id,
                unidad_destino_id=destino.id,
            ).first()
            if not existe:
                db.add(ConversionUnidades(
                    unidad_origen_id=origen.id,
                    unidad_destino_id=destino.id,
                    factor=factor,
                ))


# ── Configuración global ────────────────────────────────────────────────────

def _seed_configuracion(db: Session) -> None:
    defaults = [
        {
            "clave": "dias_alerta_vencimiento",
            "valor": "7",
            "descripcion": "Días de anticipación para alertar sobre lotes próximos a vencer",
        },
        {
            "clave": "moneda",
            "valor": "ARS",
            "descripcion": "Moneda del sistema",
        },
        {
            "clave": "nombre_negocio",
            "valor": "Simmons",
            "descripcion": "Nombre del negocio",
        },
        {
            "clave": "stock_alerta_activo",
            "valor": "true",
            "descripcion": "Activar alertas de stock mínimo",
        },
    ]
    for cfg in defaults:
        if not db.query(Configuracion).filter_by(clave=cfg["clave"]).first():
            db.add(Configuracion(**cfg))