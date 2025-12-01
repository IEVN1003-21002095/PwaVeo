import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./catalogo/catalogoC.routes').then(m => m.CATALOGO_CLIENTE_ROUTES)
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES)
  },
  {
    path: 'pedidos',
    loadChildren: () =>
      import('./pedidos/orders.routes').then(m => m.ORDERS_ROUTES)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./carrito/cart-page/cart-page.component').then(c => c.CartPageComponent)
  },
  {
    path: 'productos',
    loadChildren: () =>
      import('./productos/products.routes').then(m => m.PRODUCTS_ROUTES)
  }
];