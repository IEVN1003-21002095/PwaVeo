import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [

  {
    path: '',
    loadChildren: () =>
      import('./catalogoCliente/catalogoC.routes')
        .then(m => m.CATALOGO_CLIENTE_ROUTES) 
  },

  {
    path: 'reviews',
    loadChildren: () =>
      import('./reviews/reviews.routes').then(m => m.REVIEWS_ROUTES)
  },

  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES) 
  },

  {
    path: 'orders',
    loadChildren: () =>
      import('./orders/orders.routes').then(m => m.ORDERS_ROUTES) 
  },

  {
    path: 'productos',
    loadChildren: () =>
      import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },


];