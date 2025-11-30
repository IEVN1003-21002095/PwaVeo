from flask import jsonify
from database import get_connection  # ✔ tu forma real de conexión


class OrdersController:

    # ---------------------------------------------------
    # 1. Obtener todos los pedidos del cliente autenticado
    # ---------------------------------------------------
    @staticmethod
    def get_orders_by_customer(customer_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        sql = """
            SELECT 
                o.id,
                o.fecha,
                o.total,
                o.estado,
                o.tracking_number
            FROM pedidos o
            WHERE o.cliente_id = %s
            ORDER BY o.fecha DESC
        """

        cursor.execute(sql, (customer_id,))
        pedidos = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "pedidos": pedidos,
            "total": len(pedidos)
        }), 200

    # ---------------------------------------------------
    # 2. Obtener detalle de un pedido específico
    # ---------------------------------------------------
    @staticmethod
    def get_order_detail(order_id, customer_id):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Encabezado del pedido
        sql_header = """
            SELECT 
                o.id,
                o.fecha,
                o.total,
                o.estado,
                o.tracking_number,
                c.direccion AS direccion_envio
            FROM pedidos o
            INNER JOIN clientes c ON c.id = o.cliente_id
            WHERE o.id = %s AND o.cliente_id = %s
        """
        cursor.execute(sql_header, (order_id, customer_id))
        pedido = cursor.fetchone()

        if not pedido:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Pedido no encontrado"}), 404

        # Items del pedido
        sql_items = """
            SELECT 
                p.nombre,
                p.precio,
                i.cantidad,
                (p.precio * i.cantidad) AS subtotal
            FROM pedidos_items i
            INNER JOIN productos p ON p.id = i.producto_id
            WHERE i.pedido_id = %s
        """
        cursor.execute(sql_items, (order_id,))
        items = cursor.fetchall()

        cursor.close()
        conn.close()

        pedido["items"] = items

        return jsonify({"success": True, "pedido": pedido}), 200
