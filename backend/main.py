from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from config import settings
from database import init_db, get_db, SessionLocal
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_active_user,
)

# Importar modelos para que SQLAlchemy los registre
try:
    from app.models.base import Usuario, Rol, CategoriaMateriaPrima
    from app.models.materia_prima import (
        UnidadMedida, ConversionUnidades, Proveedor,
        ProductoMateriaPrima, LoteMateriaPrima,
    )
    from app.models.recetas_productos import (
        Receta, RecetaIngrediente,
        Producto, InventarioProductoPorEstado, LoteProducto,
    )
    from app.models.produccion import (
        OrdenProduccion, TransformacionProduccion,
    )
    from app.models.ventas import Venta, VentaItem
    from app.models.auditoria import MovimientoInventario, AuditoriaCambios
except ImportError:
    # Si los modelos no están en app/, importar directamente
    from models_base import Usuario, Rol, CategoriaMateriaPrima
    from models_materia_prima import (
        UnidadMedida, ConversionUnidades, Proveedor,
        ProductoMateriaPrima, LoteMateriaPrima,
    )
    from models_recetas_productos import (
        Receta, RecetaIngrediente,
        Producto, InventarioProductoPorEstado, LoteProducto,
    )
    from models_produccion import (
        OrdenProduccion, TransformacionProduccion,
    )
    from models_ventas import Venta, VentaItem
    from models_auditoria import MovimientoInventario, AuditoriaCambios

from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UsuarioCreate,
    UsuarioRead,
    UsuarioReadMe,
)

# Inicializar aplicación
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para gestión de panadería Simmons"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STARTUP ====================

@app.on_event("startup")
def startup():
    """Inicializar BD y datos semilla"""
    init_db()
    if settings.CREATE_SEED_DATA:
        seed_initial_data()

# ==================== HEALTH CHECK ====================

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": settings.APP_NAME}

# ==================== AUTENTICACIÓN ====================

@app.post("/api/v1/auth/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login de usuario"""
    user = db.query(Usuario).filter(Usuario.email == request.username).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/v1/auth/register", response_model=UsuarioRead)
def register(
    request: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """Registro de usuario (solo en desarrollo/setup)"""
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registro no permitido en producción"
        )
    
    # Verificar si ya existe
    if db.query(Usuario).filter(Usuario.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email ya registrado"
        )
    
    # Crear usuario
    user = Usuario(
        nombre=request.nombre,
        email=request.email,
        password_hash=hash_password(request.password),
        rol_id=request.rol_id,
        sucursal_id=request.sucursal_id,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@app.get("/api/v1/auth/me", response_model=UsuarioReadMe)
def get_current_user_endpoint(
    current_user = Depends(get_current_active_user)
):
    """Obtener usuario actual autenticado"""
    return current_user

# ==================== PLACEHOLDER PARA RUTAS ====================

@app.get("/api/v1/materia-prima")
def get_materia_prima(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener lista de materia prima"""
    return []

@app.get("/api/v1/productos")
def get_productos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener lista de productos finales"""
    return []

@app.get("/api/v1/recetas")
def get_recetas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener lista de recetas"""
    return []

@app.get("/api/v1/ventas")
def get_ventas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener lista de ventas"""
    return []

@app.get("/api/v1/produccion")
def get_produccion(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener órdenes de producción"""
    return []

@app.get("/api/v1/reportes/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user) if settings.REQUIRE_AUTH else None
):
    """Obtener datos del dashboard"""
    return {
        "total_ventas_hoy": 0,
        "productos_stock_bajo": [],
        "ordenes_pendientes": [],
        "mensaje": "Dashboard vacío - backend en construcción"
    }

# ==================== FUNCIÓN SEED ====================

def seed_initial_data():
    """Crear datos iniciales"""
    db = SessionLocal()
    try:
        # Verificar si ya existe datos
        if db.query(Rol).count() > 0:
            return
        
        # Crear roles
        roles = [
            Rol(nombre="admin", descripcion="Administrador"),
            Rol(nombre="gerente", descripcion="Gerente"),
            Rol(nombre="panadero", descripcion="Panadero"),
            Rol(nombre="barista", descripcion="Barista"),
            Rol(nombre="cajero", descripcion="Cajero"),
        ]
        
        for rol in roles:
            db.add(rol)
        
        db.commit()
        
        # Crear usuario admin
        admin_rol = db.query(Rol).filter(Rol.nombre == "admin").first()
        admin_user = Usuario(
            nombre="Administrador",
            email="admin@simmons.local",
            password_hash=hash_password("admin123"),
            rol_id=admin_rol.id,
            activo=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Datos iniciales creados exitosamente")
        print("   Email: admin@simmons.local")
        print("   Contraseña: admin123")
        
    except Exception as e:
        print(f"⚠️ Error al crear datos iniciales: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )