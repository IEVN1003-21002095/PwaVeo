import pymysql
import os
import ssl
from dotenv import load_dotenv
load_dotenv()

class ProductController:

    def __init__(self):
        try:
            self.connection = pymysql.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database="VeoDatabase",
                cursorclass=pymysql.cursors.DictCursor,
                ssl=ssl.create_default_context(),
                autocommit=True
            )
            print("[ProductController] Conexión exitosa")
        except Exception as e:
            print(f"[ProductController] Error de conexión: {e}")
            self.connection = None

    def get_cursor(self):
        if not self.connection or not self.connection.open:
            self.connection = pymysql.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database="VeoDatabase",
                cursorclass=pymysql.cursors.DictCursor,
                ssl=ssl.create_default_context(),
                autocommit=True
            )
        return self.connection.cursor()

    # ==================== PRODUCTOS ====================
    def list_products(self):
        try:
            with self.get_cursor() as cursor:
                cursor.execute("SELECT * FROM productos")
                data = cursor.fetchall()
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def create(self, data):
        try:
            fields = ["nombre", "precio", "categoria", "costo", "descripcion", "proveedor_id", "activo"]
            values = [data.get(f) for f in fields]

            if not values[0]:
                return {"success": False, "message": "El nombre es obligatorio."}

            with self.get_cursor() as cursor:
                sql = f"""
                    INSERT INTO productos 
                    ({", ".join(fields)}, creado_en)
                    VALUES ({", ".join(['%s'] * len(fields))}, NOW())
                """
                cursor.execute(sql, values)

            return {"success": True, "message": "Producto creado correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def update(self, product_id, data):
        try:
            nombre = data.get("nombre")
            precio = data.get("precio")
            categoria = data.get("categoria")
            costo = data.get("costo")
            descripcion = data.get("descripcion")
            proveedor_id = data.get("proveedor_id")
            activo = data.get("activo")

            with self.get_cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE productos 
                    SET nombre=%s, precio=%s, categoria=%s, costo=%s, descripcion=%s,
                        proveedor_id=%s, activo=%s, actualizado_en=NOW()
                    WHERE id=%s
                    """,
                    (nombre, precio, categoria, costo, descripcion, proveedor_id, activo, product_id)
                )
            return {"success": True, "message": "Producto actualizado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def delete(self, product_id):
        try:
            with self.get_cursor() as cursor:
                cursor.execute("DELETE FROM productos WHERE id=%s", (product_id,))
            return {"success": True, "message": "Producto eliminado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    # ==================== INVENTARIO / VARIANTES ====================
    def get_inventory(self, product_id):
        try:
            with self.get_cursor() as cursor:
                sql = """
                    SELECT i.id, i.producto_id,
                           i.color_id, c.color,
                           i.talla_id, t.talla,
                           i.cantidad, i.ubicacion
                    FROM inventario i
                    LEFT JOIN colores c ON i.color_id = c.id
                    LEFT JOIN tallas t ON i.talla_id = t.id
                    WHERE i.producto_id = %s
                """
                cursor.execute(sql, (product_id,))
                data = cursor.fetchall()
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def get_variant(self, inventory_id):
        try:
            with self.get_cursor() as cursor:
                sql = """
                    SELECT i.id, i.producto_id,
                           i.color_id, c.color,
                           i.talla_id, t.talla,
                           i.cantidad, i.ubicacion
                    FROM inventario i
                    LEFT JOIN colores c ON i.color_id = c.id
                    LEFT JOIN tallas t ON i.talla_id = t.id
                    WHERE i.id = %s
                """
                cursor.execute(sql, (inventory_id,))
                data = cursor.fetchone()
            if not data:
                return {"success": False, "message": "Variante no encontrada"}, 404
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "message": str(e)}, 500

    def add_variant(self, data):
        try:
            producto_id = data.get("producto_id")
            color_id = data.get("color_id")
            talla_id = data.get("talla_id")
            cantidad = data.get("cantidad", 0)
            ubicacion = data.get("ubicacion", "")

            if not all([producto_id, color_id, talla_id]):
                return {"success": False, "message": "producto_id, color_id y talla_id son obligatorios."}

            with self.get_cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM inventario WHERE producto_id=%s AND color_id=%s AND talla_id=%s",
                    (producto_id, color_id, talla_id)
                )
                if cursor.fetchone():
                    return {"success": False, "message": "Esa combinación de Color y Talla ya existe."}

                cursor.execute(
                    "INSERT INTO inventario (producto_id, color_id, talla_id, cantidad, ubicacion, creado_en) "
                    "VALUES (%s, %s, %s, %s, %s, NOW())",
                    (producto_id, color_id, talla_id, cantidad, ubicacion)
                )
            return {"success": True, "message": "Variante agregada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def update_variant(self, inventory_id, data):
        try:
            with self.get_cursor() as cursor:
                sql = """
                    UPDATE inventario 
                    SET cantidad=%s, ubicacion=%s, actualizado_en=NOW()
                    WHERE id=%s
                """
                cursor.execute(sql, (
                    data.get("cantidad"),
                    data.get("ubicacion"),
                    inventory_id
                ))
            return {"success": True, "message": "Inventario actualizado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def delete_variant(self, inventory_id):
        try:
            with self.get_cursor() as cursor:
                cursor.execute(
                    "DELETE FROM venta_detalle WHERE inventario_id = %s",
                    (inventory_id,)
                )

                cursor.execute(
                    "DELETE FROM inventario WHERE id = %s",
                    (inventory_id,)
                )

            return {"success": True, "message": "Variante eliminada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}
