#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.database import SessionLocal
from app.models.base import CategoriaMateriaPrima, Rol, Usuario
from app.models.materia_prima import ProductoMateriaPrima, LoteMateriaPrima, Proveedor, UnidadMedida
from app.models.recetas_productos import Receta, RecetaIngrediente, Producto
from datetime import datetime, timedelta

def crear_datos():
    db = SessionLocal()
    try:
        print("🔄 Insertando datos...")
        
        # Crear categorías
        cats = {}
        for nombre in ["Harinas", "Levaduras", "Grasas", "Lácteos", "Huevos", "Azúcares"]:
            c = db.query(CategoriaMateriaPrima).filter_by(nombre=nombre).first()
            if not c:
                c = CategoriaMateriaPrima(nombre=nombre)
                db.add(c)
            cats[nombre] = c
        db.commit()
        
        # Crear unidades
        unis = {}
        for abbr, nombre in [("kg","Kg"), ("l","Litro"), ("unidad","Unidad"), ("docena","Docena")]:
            u = db.query(UnidadMedida).filter_by(abreviatura=abbr).first()
            if not u:
                u = UnidadMedida(nombre=nombre, abreviatura=abbr)
                db.add(u)
            unis[abbr] = u
        db.commit()
        
        # Crear proveedor
        prov = db.query(Proveedor).filter_by(nombre="Molino La Paz").first()
        if not prov:
            prov = Proveedor(nombre="Molino La Paz", descripcion="Harinas", contacto="info@molino.com", telefono="1234567", activo=True)
            db.add(prov)
        db.commit()
        
        # Crear materias primas
        mps = {}
        for nombre, desc, cat_name, uni_abbr, precio in [
            ("Harina 000", "Harina blanca", "Harinas", "kg", 50),
            ("Levadura", "Levadura fresca", "Levaduras", "kg", 150),
            ("Manteca", "Manteca", "Grasas", "kg", 100),
            ("Huevos", "Huevos frescos", "Huevos", "docena", 80),
            ("Azúcar", "Azúcar blanco", "Azúcares", "kg", 35),
        ]:
            mp = db.query(ProductoMateriaPrima).filter_by(nombre=nombre).first()
            if not mp:
                mp = ProductoMateriaPrima(nombre=nombre, descripcion=desc, categoria_id=cats[cat_name].id, unidad_medida_id=unis[uni_abbr].id, precio_unitario=precio, stock_minimo=5, activo=True)
                db.add(mp)
            mps[nombre] = mp
        db.commit()
        
        # Crear lotes
        for mp_name, lote_num, cant in [("Harina 000", "LOTE-001", 100), ("Levadura", "LOTE-002", 10), ("Manteca", "LOTE-003", 20)]:
            lote = db.query(LoteMateriaPrima).filter_by(lote_numero=lote_num).first()
            if not lote:
                lote = LoteMateriaPrima(producto_id=mps[mp_name].id, lote_numero=lote_num, cantidad_inicial=cant, cantidad_actual=cant, precio_total=cant*50, fecha_compra=datetime.now(), fecha_vencimiento=datetime.now()+timedelta(days=180), proveedor_id=prov.id, activo=True)
                db.add(lote)
        db.commit()
        
        # Crear recetas
        recs = {}
        for nombre, desc, rend, uni_abbr in [
            ("Pan Francés", "Pan crujiente", 10, "unidad"),
            ("Medialunas", "Medialunas de manteca", 20, "unidad"),
            ("Bizcochuelos", "Bizcochuelos", 12, "unidad"),
        ]:
            rec = db.query(Receta).filter_by(nombre=nombre).first()
            if not rec:
                rec = Receta(nombre=nombre, descripcion=desc, rendimiento=rend, unidad_rendimiento_id=unis[uni_abbr].id, tiempo_preparacion=90, costo_estimado=50, activo=True)
                db.add(rec)
            recs[nombre] = rec
        db.commit()
        
        # Crear ingredientes
        ing_data = [
            ("Pan Francés", "Harina 000", 5, "kg"),
            ("Pan Francés", "Levadura", 0.05, "kg"),
            ("Medialunas", "Harina 000", 3, "kg"),
            ("Medialunas", "Manteca", 1.5, "kg"),
            ("Bizcochuelos", "Harina 000", 2, "kg"),
            ("Bizcochuelos", "Huevos", 2, "docena"),
        ]
        for rec_name, mp_name, cant, uni_abbr in ing_data:
            ing = db.query(RecetaIngrediente).filter_by(receta_id=recs[rec_name].id, producto_materia_prima_id=mps[mp_name].id).first()
            if not ing:
                ing = RecetaIngrediente(receta_id=recs[rec_name].id, producto_materia_prima_id=mps[mp_name].id, cantidad=cant, unidad_medida_id=unis[uni_abbr].id)
                db.add(ing)
        db.commit()
        
        # Crear productos
        for nombre, desc, rec_name, precio in [
            ("Pan Francés", "Pan crujiente", "Pan Francés", 80),
            ("Medialunas x4", "Pack 4", "Medialunas", 120),
            ("Bizcochuelos", "Caseros", "Bizcochuelos", 60),
        ]:
            prod = db.query(Producto).filter_by(nombre=nombre).first()
            if not prod:
                prod = Producto(nombre=nombre, descripcion=desc, receta_id=recs[rec_name].id, precio_unitario=precio, stock_minimo=0, activo=True)
                db.add(prod)
        db.commit()
        
        print("✅ ¡Datos insertados!")
        print(f"   • Recetas: {db.query(Receta).count()}")
        print(f"   • Materias Primas: {db.query(ProductoMateriaPrima).count()}")
        print(f"   • Productos: {db.query(Producto).count()}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    crear_datos()
