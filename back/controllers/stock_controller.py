import pymysql
import os
import ssl

class StockController:

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
    # LISTAR TODO
    # =========================================================
    def list_stock(self):
        try:
            with self.connection.cursor() as cursor:
                cursor.execute("SELECT * FROM stock_insumos")
                data = cursor.fetchall()

            return {"success": True, "total": len(data), "data": data}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # CREAR
    # =========================================================
    def create(self, data):
        try:
            nombre_insumo = data.get("nombre_insumo")
            color_id = data.get("color_id")
            talla_id = data.get("talla_id")
            cantidad = data.get("cantidad")
            unidad = data.get("unidad")
            precio = data.get("precio")
            estado = data.get("estado")

            with self.connection.cursor() as cursor:
                sql = """
                    INSERT INTO stock_insumos 
                    (nombre_insumo, color_id, talla_id, cantidad, unidad, precio, estado)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    nombre_insumo, color_id, talla_id, cantidad, unidad, precio, estado
                ))
                self.connection.commit()

            return {"success": True, "message": "Insumo agregado correctamente"}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # ACTUALIZAR
    # =========================================================
    def update(self, id, data):
        try:
            nombre_insumo = data.get("nombre_insumo")
            color_id = data.get("color_id")
            talla_id = data.get("talla_id")
            cantidad = data.get("cantidad")
            unidad = data.get("unidad")
            precio = data.get("precio")
            estado = data.get("estado")

            with self.connection.cursor() as cursor:
                sql = """
                    UPDATE stock_insumos SET 
                        nombre_insumo=%s,
                        color_id=%s,
                        talla_id=%s,
                        cantidad=%s,
                        unidad=%s,
                        precio=%s,
                        estado=%s,
                        fecha_registro = NOW()
                    WHERE id=%s
                """

                cursor.execute(sql, (
                    nombre_insumo, color_id, talla_id, cantidad,
                    unidad, precio, estado, id
                ))

                self.connection.commit()

            return {"success": True, "message": "Insumo actualizado correctamente"}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # ELIMINAR
    # =========================================================
    def delete(self, id):
        try:
            with self.connection.cursor() as cursor:
                sql = "DELETE FROM stock_insumos WHERE id=%s"
                cursor.execute(sql, (id,))
                self.connection.commit()

            return {"success": True, "message": "Insumo eliminado correctamente"}

        except Exception as e:
            return {"success": False, "message": str(e)}
