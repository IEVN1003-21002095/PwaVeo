from database import get_all_clientes

class AuthController:

    def list_clientes(self):
        """
        Lógica del módulo para obtener la lista de clientes.
        """
        clientes = get_all_clientes()
        return clientes
