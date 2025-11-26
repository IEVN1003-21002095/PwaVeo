import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',

    loadChildren: () =>
      import('./dashboard/dashboard-home/dashboard-home.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/customers.routes').then(m => m.CUSTOMERS_ROUTES)
  },
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./gestionCatalogo/gestionCatalogo.routes')
  },
  {
    path: 'inventario', 
    loadChildren: () =>
      import('./gestionStock/inventario.routes').then(m => m.INVENTARIO_ROUTES) 
  },
  // Módulo de Ventas
  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.routes').then(m => m.SALES_ROUTES)
  }
];