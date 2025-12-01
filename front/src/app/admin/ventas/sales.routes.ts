import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-list/sales-list.component').then(m => m.SalesListComponent)
  },
  {
    path: ':ventaId',
    loadComponent: () =>
      import('./sales-detail/sales-detail.component').then(m => m.SalesDetailComponent)
  }
];
