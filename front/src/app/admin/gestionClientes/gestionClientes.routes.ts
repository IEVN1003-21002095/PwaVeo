import { Routes } from '@angular/router';
import { GestionClientesComponent } from './gestionClientes.component';

// Exportamos una constante con las rutas
export const CLIENTES_ROUTES: Routes = [
    { 
        path: '', 
        component: GestionClientesComponent 
    }
];