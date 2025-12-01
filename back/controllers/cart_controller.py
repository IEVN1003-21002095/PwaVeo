from database import get_connection
from controllers.product_controller import ProductController

class CartController:
    def __init__(self):
        self.product_controller = ProductController()

    def validate_cart(self, cart_items):
        """
        Recibe un arreglo de items: { productoId, color, talla, cantidad }
        Valida que exista stock para cada variante. Retorna dict con issues si hay.
        """
        issues = []
        try:
            for item in cart_items:
                pid = item.get('productoId') or item.get('producto_id')
                color = item.get('color')
                talla = item.get('talla')
                qty = int(item.get('cantidad', 0))

                inv_resp = self.product_controller.get_inventory(pid)
                if not inv_resp.get('success'):
                    issues.append({
                        'productoId': pid,
                        'message': 'No se pudo consultar inventario'
                    })
                    continue

                variantes = inv_resp.get('data', [])
                encontrada = None
                for v in variantes:
                    if str(v.get('color')) == str(color) and str(v.get('talla')) == str(talla):
                        encontrada = v
                        break

                disponible = int(encontrada.get('cantidad', 0)) if encontrada else 0
                if disponible < qty:
                    issues.append({
                        'productoId': pid,
                        'color': color,
                        'talla': talla,
                        'available': disponible,
                        'requested': qty,
                        'message': 'Stock insuficiente'
                    })

            if issues:
                return { 'success': False, 'issues': issues }
            return { 'success': True }
        except Exception as e:
            return { 'success': False, 'message': str(e) }
