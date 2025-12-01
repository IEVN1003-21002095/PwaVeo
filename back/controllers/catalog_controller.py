import pymysql
import os
import ssl

class CatalogController:

    def __init__(self):
        ssl_context = ssl.create_default_context()

        self.connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database="VeoDatabase",
            cursorclass=pymysql.cursors.DictCursor,
            ssl=ssl_context
        )

    # =========================================================
    # LISTAR PRODUCTOS 
    # =========================================================
    def list_catalog_products(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, nombre, descripcion, precio, categoria, activo
                    FROM productos
                    WHERE activo = 1
                """)
                data = cursor.fetchall()

            return {"success": True, "total": len(data), "data": data}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # DETALLE DE PRODUCTO (con variaciones de color y talla)
    # =========================================================
    def get_product_detail(self, product_id):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, nombre, descripcion, precio, categoria, activo
                    FROM productos
                    WHERE id = %s
                """, (product_id,))
                product = cursor.fetchone()

                if not product:
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

            return {
                "success": True,
                "data": {
                    **product,
                    "variaciones": variations
                }
            }

        except Exception as e:
            return {"success": False, "message": str(e)}
