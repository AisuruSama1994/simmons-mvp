#!/usr/bin/env python3
import psycopg2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

conn = psycopg2.connect(
    host="localhost",
    database="simmons_db",
    user="simmons",
    password="simmons123"
)
cur = conn.cursor()

try:
    print("🔄 Creando rol admin...")
    cur.execute("INSERT INTO roles (nombre, descripcion) VALUES ('admin', 'Administrador') ON CONFLICT DO NOTHING")
    
    cur.execute("SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1")
    rol_id = cur.fetchone()[0]
    
    print(f"  ✓ Rol ID: {rol_id}")
    print("🔄 Creando usuario...")
    
    password_hash = pwd_context.hash("admin123")
    cur.execute(
        "INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) VALUES (%s, %s, %s, %s, true) ON CONFLICT DO NOTHING",
        ("Admin Simmons", "admin@simmons.local", password_hash, rol_id)
    )
    
    conn.commit()
    print("✅ Usuario creado: admin@simmons.local / admin123")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()
