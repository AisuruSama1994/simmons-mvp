#!/usr/bin/env python3
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="simmons_db",
    user="simmons",
    password="simmons123"
)
cur = conn.cursor()

try:
    print("🔄 Insertando unidades...")
    
    cur.execute("INSERT INTO unidades_medida (nombre, abreviacion, tipo) VALUES ('Unidad', 'un', 'cantidad') ON CONFLICT DO NOTHING")
    cur.execute("INSERT INTO unidades_medida (nombre, abreviacion, tipo) VALUES ('Kilogramo', 'kg', 'peso') ON CONFLICT DO NOTHING")
    cur.execute("INSERT INTO unidades_medida (nombre, abreviacion, tipo) VALUES ('Litro', 'l', 'volumen') ON CONFLICT DO NOTHING")
    conn.commit()
    
    cur.execute("SELECT id FROM unidades_medida WHERE nombre = 'Unidad' LIMIT 1")
    unidad_id = cur.fetchone()[0]
    
    print(f"  ✓ Unidad ID: {unidad_id}")
    print("🔄 Insertando categorías...")
    
    cur.execute("INSERT INTO categorias_materia_prima (nombre) VALUES ('Harinas') ON CONFLICT DO NOTHING")
    cur.execute("INSERT INTO categorias_materia_prima (nombre) VALUES ('Levaduras') ON CONFLICT DO NOTHING")
    cur.execute("INSERT INTO categorias_materia_prima (nombre) VALUES ('Grasas') ON CONFLICT DO NOTHING")
    conn.commit()
    
    cur.execute("SELECT id FROM categorias_materia_prima WHERE nombre = 'Harinas' LIMIT 1")
    cat_id = cur.fetchone()[0]
    
    print(f"  ✓ Categoría ID: {cat_id}")
    print("🔄 Insertando recetas...")
    
    cur.execute(f"INSERT INTO recetas (nombre, descripcion, rendimiento, unidad_rendimiento_id, tiempo_preparacion, costo_estimado, activo) VALUES ('Pan Francés', 'Pan crujiente clásico', 10, {unidad_id}, 120, 50, true) ON CONFLICT DO NOTHING")
    cur.execute(f"INSERT INTO recetas (nombre, descripcion, rendimiento, unidad_rendimiento_id, tiempo_preparacion, costo_estimado, activo) VALUES ('Medialunas', 'Medialunas de manteca', 20, {unidad_id}, 90, 50, true) ON CONFLICT DO NOTHING")
    cur.execute(f"INSERT INTO recetas (nombre, descripcion, rendimiento, unidad_rendimiento_id, tiempo_preparacion, costo_estimado, activo) VALUES ('Bizcochuelos', 'Bizcochuelos esponjosos', 12, {unidad_id}, 45, 50, true) ON CONFLICT DO NOTHING")
    
    conn.commit()
    print("✅ ¡Datos insertados exitosamente!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cur.close()
    conn.close()
