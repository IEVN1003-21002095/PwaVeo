class AuthController:


    def index(self):
        # Aquí puedes devolver un listado o status
        return {"status": "ok", "module": "auth", "action": "index", "data": []}


    def create(self, data: dict):
        # Implementa validaciones e inserción
        return {"status": "created", "module": "auth", "action": "create", "data": data}

    def update(self, item_id: int, data: dict):
        # Implementa actualización
        return {"status": "updated", "module": "auth", "action": "update", "id": item_id, "data": data}

    def delete(self, item_id: int):
        # Implementa borrado
        return {"status": "deleted", "module": "auth", "action": "delete", "id": item_id}
