import pymysql
import os
import ssl
from database import get_connection
from dotenv import load_dotenv
load_dotenv()

class CatalogController:

    def __init__(self):
        pass

    # =========================================================
    # LISTAR PRODUCTOS 
    # =========================================================
    def list_catalog_products(self):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, nombre, descripcion, precio, categoria, activo
                FROM productos
                WHERE activo = 1
            """)
            data = cursor.fetchall()
            cursor.close()

            return {"success": True, "total": len(data), "data": data}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # DETALLE DE PRODUCTO (con variaciones de color y talla)
    # =========================================================
    def get_product_detail(self, product_id):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, nombre, descripcion, precio, categoria, activo
                FROM productos
                WHERE id = %s
            """, (product_id,))
            product = cursor.fetchone()

            if not product:
                cursor.close()
                return {"success": False, "message": "Producto no encontrado"}

            cursor.execute("""
                SELECT 
                    c.color, c.codigo_hex, 
                    t.talla, t.tipo AS tipo_talla, 
                    i.cantidad, i.ubicacion
                FROM inventario i
                JOIN colores c ON i.color_id = c.id
                JOIN tallas t ON i.talla_id = t.id
                WHERE i.producto_id = %s
            """, (product_id,))
            variations = cursor.fetchall()
            cursor.close()

            return {
                "success": True,
                "data": {
                    **product,
                    "variaciones": variations
                }
            }

        except Exception as e:
            return {"success": False, "message": str(e)}
