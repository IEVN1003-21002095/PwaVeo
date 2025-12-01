import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/dashboard-home.component')
        .then(m => m.DashboardHomeComponent)
  },
  {
    path: 'clientes',
    loadChildren: () =>
      import('./gestionClientes/gestionClientes.routes').then(m => m.CLIENTES_ROUTES)
  },
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./gestionCatalogo/gestionCatalogo.routes').then(m => m.GESTION_CATALOGO_ROUTES)
  },
  {
    path: 'inventario',
    loadChildren: () =>
      import('./gestionStock/inventario.routes').then(m => m.GESTION_INVENTARIO_ROUTES)
  },
  {
    path: 'ventas',
    loadChildren: () =>
      import('./ventas/sales.routes').then(m => m.SALES_ROUTES)
  },
  {
    path: 'reviews',
    loadChildren: () =>
      import('./reviewAdmin/reviewAdmin.routes').then(m => m.REVIEW_ADMIN_ROUTES)
  }
];
