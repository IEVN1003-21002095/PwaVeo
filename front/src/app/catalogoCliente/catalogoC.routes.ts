import { Routes } from '@angular/router';

export const CATALOGO_C_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalogo-c/catalogo-c.component')
        .then(m => m.CatalogoClienteComponent)
  },

  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },

  {
    path: 'info/:id',
    loadComponent: () =>
      import('./detalles/detalles.component')
        .then(m => m.DetallesComponent)
  }
];
