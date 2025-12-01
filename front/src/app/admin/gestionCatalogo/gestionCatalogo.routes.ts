import { Routes } from '@angular/router';

export const GESTION_CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalogo/catalogo.component').then(m => m.CatalogoComponent),
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
      },
      {
        path: 'inventario/:id',
        loadComponent: () => import('./abc-variante/inventario-producto/inventario-producto.component').then(m => m.InventarioProductoComponent),
        children: [
          {
            path: 'agregar',
            loadComponent: () => import('./abc-variante/agregar/agregar-variante.component').then(m => m.AgregarVarianteComponent)
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./abc-variante/editar/editar-variante.component').then(m => m.EditarVarianteComponent)
          },
          {
            path: 'eliminar/:id',
            loadComponent: () => import('./abc-variante/eliminar/eliminar-variante.component').then(m => m.EliminarVarianteComponent)
          }
        ]
      }
    ]
  }
];
