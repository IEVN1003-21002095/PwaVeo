from database import get_connection
import math
import traceback

class CustomerController:

    def list_clients(self, page=1, per_page=10, search=None):
        offset = (page - 1) * per_page
        conn = None
        cursor = None
        
        try:
            conn = get_connection()
            cursor = conn.cursor() 

            base_query = """
                SELECT u.id, u.nombre, u.apellido, u.correo, c.fecha_registro
                FROM usuarios u
                LEFT JOIN clientes c ON u.id = c.usuario_id
                WHERE u.rol = 'cliente'
            """

            params = ()
            if search:
                base_query += " AND (u.nombre LIKE %s OR u.apellido LIKE %s OR u.correo LIKE %s)"
                search_param = f"%{search}%"
                params = (search_param, search_param, search_param)

            count_query = f"SELECT COUNT(*) as total FROM ({base_query}) AS subquery"
            cursor.execute(count_query, params)
            result_total = cursor.fetchone()
            
            total = 0
            if result_total:
                if isinstance(result_total, dict):
                    total = result_total['total']
                else:
                    total = result_total[0]

            base_query += " ORDER BY u.nombre ASC LIMIT %s OFFSET %s"
            params += (per_page, offset)
            cursor.execute(base_query, params)
            clientes = cursor.fetchall()

            result = []
            for cliente in clientes:
                if isinstance(cliente, dict):
                    c_id = cliente['id']
                    nom = cliente['nombre'] if cliente['nombre'] else ""
                    ape = cliente['apellido'] if cliente['apellido'] else ""
                    c_nombre = f"{nom} {ape}".strip()
                    c_correo = cliente['correo']
                    c_fecha = cliente['fecha_registro']
                else:
                    c_id = cliente[0]
                    nom = cliente[1] if cliente[1] else ""
                    ape = cliente[2] if cliente[2] else ""
                    c_nombre = f"{nom} {ape}".strip()
                    c_correo = cliente[3]
                    c_fecha = cliente[4]

                result.append({
                    "id": c_id,
                    "nombre_completo": c_nombre,
                    "correo": c_correo,
                    "fecha_registro": c_fecha.strftime("%Y-%m-%d %H:%M:%S") if c_fecha else "Sin fecha"
                })

            return {
                "success": True,
                "page": page,
                "per_page": per_page,
                "total_clients": total,
                "total_pages": math.ceil(total / per_page) if per_page > 0 else 0,
                "clientes": result
            }

        except Exception as e:
            traceback.print_exc() 
            return {"success": False, "message": str(e)}
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def get_client_detail(self, client_id):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            query = """
                SELECT c.id, u.nombre, u.apellido, u.correo, c.direccion, c.telefono
                FROM clientes c
                JOIN usuarios u ON c.usuario_id = u.id
                WHERE u.id = %s
            """
            cursor.execute(query, (client_id,))
            row = cursor.fetchone()
            
            if not row:
                return {"success": False, "message": "Cliente no encontrado"}

            if isinstance(row, dict):
                c_id = row['id']
                nom = row['nombre']
                ape = row['apellido']
                email = row['correo']
                dire = row['direccion']
                tel = row['telefono']
            else:
                c_id = row[0]
                nom = row[1]
                ape = row[2]
                email = row[3]
                dire = row[4]
                tel = row[5]

            cliente = {
                "id": c_id,
                "nombre_completo": f"{nom} {ape}".strip(),
                "correo": email,
                "direccion": dire if dire else "",
                "telefono": tel if tel else ""
            }

            return {"success": True, "cliente": cliente}

        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def update_client_contact(self, client_id, data):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            direccion = data.get("direccion")
            telefono = data.get("telefono")
            
            query = "UPDATE clientes SET direccion = %s, telefono = %s WHERE id = %s"
            cursor.execute(query, (direccion, telefono, client_id))
            conn.commit()
            
            return {"success": True, "message": "Información actualizada"}

        except Exception as e:
            if conn: conn.rollback()
            return {"success": False, "message": str(e)}
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def delete_client(self, client_id):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()

            query_clientes = "DELETE FROM clientes WHERE usuario_id = %s"
            cursor.execute(query_clientes, (client_id,))

            query_usuarios = "DELETE FROM usuarios WHERE id = %s"
            cursor.execute(query_usuarios, (client_id,))
            
            conn.commit()
            
            if cursor.rowcount > 0:
                return {"success": True, "message": "Cliente eliminado correctamente"}
            else:
                return {"success": False, "message": "No se encontró el cliente"}

        except Exception as e:
            if conn: conn.rollback()
            return {"success": False, "message": str(e)}
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def get_client_orders(self, client_id):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            query = """
                SELECT v.id, v.total, v.estado, m.metodo
                FROM ventas v
                LEFT JOIN metodos_pago m ON v.metodo_pago_id = m.id
                WHERE v.cliente_id = (SELECT id FROM clientes WHERE usuario_id = %s)
                ORDER BY v.id DESC
            """
            cursor.execute(query, (client_id,))
            rows = cursor.fetchall()
            
            pedidos = []
            for row in rows:
                if isinstance(row, dict):
                     pedidos.append({
                        "id": row['id'],
                        "total": float(row['total']),
                        "estado": row['estado'],
                        "metodo_pago": row['metodo']
                    })
                else:
                    pedidos.append({
                        "id": row[0],
                        "total": float(row[1]),
                        "estado": row[2],
                        "metodo_pago": row[3]
                    })

            return {"success": True, "pedidos": pedidos}

        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            if cursor: cursor.close()
            if conn: conn.close()