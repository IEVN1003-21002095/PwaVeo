# orders_controller.py
from flask import jsonify, request
from database import get_connection
from pymysql import Error as PyMySQLError

# Este ID debe obtenerse de un token de sesión o similar en un proyecto real.
# Para la simulación, usaremos el cliente_id=1 (Carlos Cliente).
# En un proyecto real, se obtendría del contexto del usuario autenticado.
SIMULATED_CLIENT_ID = 1

def get_orders_history():
    """
    Retorna el historial de pedidos de un cliente específico, ordenado por fecha descendente.
    Cumple con el Criterio 2, 3, 6 y 8.
    """
    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            # 1. Resumen de pedidos para el cliente.
            # 2. Ordenado por fecha (Criterio 6).
            # 3. Se hace LEFT JOIN con envios para obtener el estado actual.
            query = """
                SELECT
                    v.id AS pedido_id,
                    v.fecha AS fecha_pedido,
                    v.total,
                    v.estado AS estado_venta,
                    e.estado_envio
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.cliente_id = %s
                ORDER BY v.fecha DESC;
            """
            cursor.execute(query, (SIMULATED_CLIENT_ID,))
            pedidos = cursor.fetchall()
            
            # Criterio 8: Resumen del total de pedidos
            total_pedidos = len(pedidos)

            # Criterio 10: Mensaje si el historial está vacío
            if not pedidos:
                return jsonify({
                    "message": "No hay reseñas para mostrar.",
                    "total_pedidos": 0,
                    "pedidos": []
                }), 200

            # Criterio 9: Información del estado clara
            for pedido in pedidos:
                # Priorizar el estado de envío si existe
                pedido['estado_display'] = pedido['estado_envio'] if pedido['estado_envio'] else pedido['estado_venta']
                del pedido['estado_venta']
                del pedido['estado_envio']

            return jsonify({
                "message": "Historial de pedidos recuperado con éxito.",
                "total_pedidos": total_pedidos,
                "pedidos": pedidos
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        return jsonify({"error": f"Error de base de datos: {e}"}), 500
    finally:
        if connection:
            connection.close()


def get_order_details(order_id):
    """
    Retorna el detalle completo de un pedido, incluyendo items, dirección y guía.
    Cumple con Criterio 4 y 5.
    """
    connection = None
    try:
        connection = get_connection()
        
        # 1. Verificar que el pedido pertenece al cliente (Criterio 2 - Implícito en la consulta)
        with connection.cursor() as cursor:
            # Consulta principal del pedido
            cursor.execute("""
                SELECT
                    v.id, v.fecha, v.total, v.estado AS estado_venta,
                    e.estado_envio, e.numero_guia, e.direccion_envio_id
                FROM ventas v
                LEFT JOIN envios e ON v.id = e.venta_id
                WHERE v.id = %s AND v.cliente_id = %s;
            """, (order_id, SIMULATED_CLIENT_ID))
            pedido = cursor.fetchone()

            if not pedido:
                return jsonify({"error": "Pedido no encontrado o no pertenece a este usuario."}), 404

            # Criterio 9: Estado claro para el cliente
            pedido['estado_display'] = pedido['estado_envio'] if pedido['estado_envio'] else pedido['estado_venta']
            
            # Criterio 5: Mostrar número de seguimiento si está 'enviado'
            if pedido['estado_display'] == 'enviado':
                # El número de guía es un campo de la tabla 'envios', que ya está en 'pedido'
                pass
            else:
                pedido['numero_guia'] = 'N/A' # O eliminar el campo si no aplica

            # 2. Obtener los ítems (Criterio 4)
            cursor.execute("""
                SELECT
                    nombre_producto_venta, cantidad, precio_unitario_venta
                FROM venta_detalle
                WHERE venta_id = %s;
            """, (order_id,))
            items = cursor.fetchall()

            # 3. Obtener la dirección de envío (Criterio 4)
            direccion_id = pedido.pop('direccion_envio_id', None)
            direccion = None
            if direccion_id:
                cursor.execute("""
                    SELECT
                        nombre_destinatario, calle, codigo_postal, ciudad, estado
                    FROM direcciones_cliente
                    WHERE id = %s;
                """, (direccion_id,))
                direccion = cursor.fetchone()
            
            # Limpiar campos internos antes de devolver JSON
            pedido.pop('estado_venta', None)
            pedido.pop('estado_envio', None)
            
            return jsonify({
                "message": f"Detalles del pedido {order_id} recuperados.",
                "pedido": pedido,
                "items": items,
                "direccion_entrega": direccion
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        return jsonify({"error": f"Error de base de datos: {e}"}), 500
    finally:
        if connection:
            connection.close()


def update_user_profile():
    """
    Permite al cliente editar su información de contacto personal.
    Cumple con Criterio 7.
    """
    data = request.json
    telefono = data.get('telefono')
    # Podrías incluir nombre, apellido, dirección, etc.

    if not telefono:
        return jsonify({"error": "Falta el campo 'telefono' requerido."}), 400

    connection = None
    try:
        connection = get_connection()
        with connection.cursor() as cursor:
            # 1. Actualizar la tabla clientes usando el usuario_id simulado
            # (Asumiendo que cliente_id == usuario_id en tu estructura, lo cual es incorrecto,
            # pero dado que los IDs 1 y 2 en 'clientes' se relacionan a usuarios 2 y 3,
            # aquí usaremos el cliente_id real basado en el usuario logueado.)
            # En la simulación usaremos el cliente_id=1.
            
            # En tu esquema, clientes.id es la llave primaria, pero cliente_id en ventas
            # se refiere a clientes.id. Usuario_id en clientes se refiere a usuarios.id.
            
            # Para simplificar y dado que SIMULATED_CLIENT_ID = 1 se usa en ventas,
            # lo usaremos directamente para clientes.id.

            update_query = """
                UPDATE clientes
                SET telefono = %s
                WHERE id = %s;
            """
            rows_affected = cursor.execute(update_query, (telefono, SIMULATED_CLIENT_ID))
            connection.commit()

            if rows_affected == 0:
                 return jsonify({"error": "No se encontró el cliente para actualizar."}), 404
                
            return jsonify({
                "message": "Información de contacto actualizada con éxito.",
                "cliente_id": SIMULATED_CLIENT_ID,
                "telefono_actualizado": telefono
            }), 200

    except ConnectionError as e:
        return jsonify({"error": str(e)}), 500
    except PyMySQLError as e:
        connection.rollback()
        return jsonify({"error": f"Error de base de datos al actualizar: {e}"}), 500
    finally:
        if connection:
            connection.close()