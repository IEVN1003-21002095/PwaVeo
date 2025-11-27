import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',

    loadChildren: () =>
      import('./dashboard/dashboard-home/dashboard-home.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./clientes/customers.routes').then(m => m.CUSTOMERS_ROUTES)
  },
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./gestion-catalogo/gestionCatalogo.routes')
  },
  {
    path: 'inventario', 
    loadChildren: () =>
      import('./gestion-stock/inventario.routes').then(m => m.INVENTARIO_ROUTES) 
  },
  // Módulo de Ventas
  {
    path: 'sales',
    loadChildren: () =>
      import('./ventas/sales.routes').then(m => m.SALES_ROUTES)
  }
];