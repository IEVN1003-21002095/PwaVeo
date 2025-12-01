from database import get_connection

class StockController:

    # =========================================================
    # LISTAR TODO
    # =========================================================
    def list_stock(self):
        try:
            conn = get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM stock_insumos")
                data = cursor.fetchall()
            conn.close()

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

            conn = get_connection()
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO stock_insumos 
                    (nombre_insumo, color_id, talla_id, cantidad, unidad, precio, estado)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    nombre_insumo, color_id, talla_id, cantidad, unidad, precio, estado
                ))
                conn.commit()
            conn.close()

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

            conn = get_connection()
            with conn.cursor() as cursor:
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

                conn.commit()
            conn.close()

            return {"success": True, "message": "Insumo actualizado correctamente"}

        except Exception as e:
            return {"success": False, "message": str(e)}

    # =========================================================
    # ELIMINAR
    # =========================================================
    def delete(self, id):
        try:
            conn = get_connection()
            with conn.cursor() as cursor:
                sql = "DELETE FROM stock_insumos WHERE id=%s"
                cursor.execute(sql, (id,))
                conn.commit()
            conn.close()

            return {"success": True, "message": "Insumo eliminado correctamente"}

        except Exception as e:
            return {"success": False, "message": str(e)}
            return {"success": False, "message": str(e)}
