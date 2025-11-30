import { Routes } from '@angular/router';

export const GESTION_INVENTARIO_ROUTES: Routes = [
  {
    path: '',
    // El componente PADRE (La lista de inventario)
    loadComponent: () => import('./inventario/inventario.component').then(c => c.InventarioComponent),
    
    // SUS HIJOS (Los modales que se mostrarán encima)
    children: [
      {
        path: 'agregar',
        loadComponent: () => import('./agregar/agregar.component').then(m => m.AgregarComponent)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./editar/editar.component').then(m => m.EditarComponent)
      },
      {
        path: 'eliminar/:id',
        loadComponent: () => import('./eliminar/eliminar.component').then(m => m.EliminarComponent)
      }
    ]
  }
];