import pymysql
import os
import ssl
from dotenv import load_dotenv
from database import get_connection
load_dotenv()

class ProductController:

    def __init__(self):
        self.connection = None

    def get_cursor(self):
        connection = get_connection()
        return connection.cursor()

    # ==================== PRODUCTOS ====================
    def list_products(self):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM productos")
            data = cursor.fetchall()
            cursor.close()
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def create(self, data):
        try:
            fields = ["nombre", "precio", "categoria", "costo", "descripcion", "proveedor_id", "activo"]
            values = [data.get(f) for f in fields]

            if not values[0]:
                return {"success": False, "message": "El nombre es obligatorio."}

            connection = get_connection()
            cursor = connection.cursor()
            fields_str = ", ".join(fields)
            placeholders = ", ".join(['%s'] * len(fields))
            sql = f"""
                INSERT INTO productos 
                ({fields_str}, creado_en)
                VALUES ({placeholders}, NOW())
            """
            cursor.execute(sql, values)
            connection.commit()
            cursor.close()

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

            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute(
                """
                UPDATE productos 
                SET nombre=%s, precio=%s, categoria=%s, costo=%s, descripcion=%s,
                    proveedor_id=%s, activo=%s, actualizado_en=NOW()
                WHERE id=%s
                """,
                (nombre, precio, categoria, costo, descripcion, proveedor_id, activo, product_id)
            )
            connection.commit()
            cursor.close()
            return {"success": True, "message": "Producto actualizado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def delete(self, product_id):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute("DELETE FROM productos WHERE id=%s", (product_id,))
            connection.commit()
            cursor.close()
            return {"success": True, "message": "Producto eliminado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    # ==================== INVENTARIO / VARIANTES ====================
    def get_inventory(self, product_id):
        try:
            connection = get_connection()
            cursor = connection.cursor()
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
            cursor.close()
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def get_variant(self, inventory_id):
        try:
            connection = get_connection()
            cursor = connection.cursor()
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
            cursor.close()
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

            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute(
                "SELECT id FROM inventario WHERE producto_id=%s AND color_id=%s AND talla_id=%s",
                (producto_id, color_id, talla_id)
            )
            if cursor.fetchone():
                cursor.close()
                return {"success": False, "message": "Esa combinación de Color y Talla ya existe."}

            cursor.execute(
                "INSERT INTO inventario (producto_id, color_id, talla_id, cantidad, ubicacion, creado_en) "
                "VALUES (%s, %s, %s, %s, %s, NOW())",
                (producto_id, color_id, talla_id, cantidad, ubicacion)
            )
            connection.commit()
            cursor.close()
            return {"success": True, "message": "Variante agregada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def update_variant(self, inventory_id, data):
        try:
            connection = get_connection()
            cursor = connection.cursor()
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
            connection.commit()
            cursor.close()
            return {"success": True, "message": "Inventario actualizado"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    def delete_variant(self, inventory_id):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute(
                "DELETE FROM venta_detalle WHERE inventario_id = %s",
                (inventory_id,)
            )

            cursor.execute(
                "DELETE FROM inventario WHERE id = %s",
                (inventory_id,)
            )

            connection.commit()
            cursor.close()
            return {"success": True, "message": "Variante eliminada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    # ==================== GESTIÓN DE IMÁGENES ====================
    
    def get_product_images(self, product_id):
        """Obtener todas las imágenes de un producto"""
        connection = None
        try:
            connection = get_connection()
            cursor = connection.cursor()
            sql = """
                SELECT img.id, img.producto_id, img.es_principal, 
                       img.color_id, c.color as color_nombre,
                       img.imagen_data, img.creado_en
                FROM imagenes_producto img
                LEFT JOIN colores c ON img.color_id = c.id
                WHERE img.producto_id = %s
                ORDER BY img.es_principal DESC, img.creado_en ASC
            """
            cursor.execute(sql, (product_id,))
            images = cursor.fetchall()
            
            # Convertir imagen_data de bytes a string si es necesario
            for img in images:
                if isinstance(img.get('imagen_data'), bytes):
                    img['imagen_data'] = img['imagen_data'].decode('utf-8')
            
            cursor.close()
            connection.close()
            return {"success": True, "data": images if images else []}
        except Exception as e:
            print(f"Error en get_product_images para producto {product_id}: {e}")
            import traceback
            traceback.print_exc()
            if connection:
                connection.close()
            return {"success": False, "message": str(e)}
    
    def add_product_image(self, data):
        """Agregar una imagen a un producto"""
        try:
            producto_id = data.get("producto_id")
            imagen_data = data.get("imagen_data")  # Base64
            es_principal = data.get("es_principal", 0)
            color_id = data.get("color_id")  # Opcional
            
            if not producto_id or not imagen_data:
                return {"success": False, "message": "producto_id e imagen_data son obligatorios"}
            
            connection = get_connection()
            cursor = connection.cursor()
            
            # Si se marca como principal, desmarcar las demás
            if es_principal:
                cursor.execute(
                    "UPDATE imagenes_producto SET es_principal = 0 WHERE producto_id = %s",
                    (producto_id,)
                )
            
            # Insertar nueva imagen
            cursor.execute(
                """INSERT INTO imagenes_producto 
                   (producto_id, es_principal, color_id, imagen_data, creado_en)
                   VALUES (%s, %s, %s, %s, NOW())""",
                (producto_id, es_principal, color_id, imagen_data)
            )
            
            image_id = cursor.lastrowid
            connection.commit()
            cursor.close()
            
            return {"success": True, "message": "Imagen agregada correctamente", "image_id": image_id}
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def update_product_image(self, image_id, data):
        """Actualizar una imagen (principalmente para marcar como principal)"""
        try:
            es_principal = data.get("es_principal")
            color_id = data.get("color_id")
            imagen_data = data.get("imagen_data")
            
            connection = get_connection()
            cursor = connection.cursor()
            
            # Obtener el producto_id de la imagen
            cursor.execute("SELECT producto_id FROM imagenes_producto WHERE id = %s", (image_id,))
            result = cursor.fetchone()
            
            if not result:
                cursor.close()
                return {"success": False, "message": "Imagen no encontrada"}
            
            producto_id = result['producto_id']
            
            # Si se marca como principal, desmarcar las demás
            if es_principal:
                cursor.execute(
                    "UPDATE imagenes_producto SET es_principal = 0 WHERE producto_id = %s",
                    (producto_id,)
                )
            
            # Actualizar la imagen
            updates = []
            params = []
            
            if es_principal is not None:
                updates.append("es_principal = %s")
                params.append(es_principal)
            
            if color_id is not None:
                updates.append("color_id = %s")
                params.append(color_id)
            
            if imagen_data is not None:
                updates.append("imagen_data = %s")
                params.append(imagen_data)
            
            if updates:
                params.append(image_id)
                sql = f"UPDATE imagenes_producto SET {', '.join(updates)} WHERE id = %s"
                cursor.execute(sql, params)
                connection.commit()
            
            cursor.close()
            return {"success": True, "message": "Imagen actualizada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def delete_product_image(self, image_id):
        """Eliminar una imagen de un producto"""
        try:
            connection = get_connection()
            cursor = connection.cursor()
            cursor.execute("DELETE FROM imagenes_producto WHERE id = %s", (image_id,))
            connection.commit()
            cursor.close()
            
            if cursor.rowcount == 0:
                return {"success": False, "message": "Imagen no encontrada"}
            
            return {"success": True, "message": "Imagen eliminada correctamente"}
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def set_principal_image(self, image_id):
        """Marcar una imagen como principal"""
        try:
            connection = get_connection()
            cursor = connection.cursor()
            
            # Obtener el producto_id
            cursor.execute("SELECT producto_id FROM imagenes_producto WHERE id = %s", (image_id,))
            result = cursor.fetchone()
            
            if not result:
                cursor.close()
                return {"success": False, "message": "Imagen no encontrada"}
            
            producto_id = result['producto_id']
            
            # Desmarcar todas las imágenes del producto
            cursor.execute(
                "UPDATE imagenes_producto SET es_principal = 0 WHERE producto_id = %s",
                (producto_id,)
            )
            
            # Marcar la imagen seleccionada como principal
            cursor.execute(
                "UPDATE imagenes_producto SET es_principal = 1 WHERE id = %s",
                (image_id,)
            )
            
            connection.commit()
            cursor.close()
            
            return {"success": True, "message": "Imagen principal actualizada"}
        except Exception as e:
            return {"success": False, "message": str(e)}

