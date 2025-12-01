import { Routes } from '@angular/router';



export const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'products',
    loadChildren: () =>
      import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },

  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/customers.routes').then(m => m.CUSTOMERS_ROUTES)
  },

  {
    path: 'reviews',
    loadChildren: () =>
      import('./reviews/reviews.routes').then(m => m.REVIEWS_ROUTES)
  },
  { 
    path: 'reviewAdmin',
    loadChildren: () => 
      import('./reviewAdmin/reviewAdmin.routes').then(m => m.REVIEW_ROUTES) 

  },

  { 
  path: 'dashboard', 
  loadChildren: () => 
  import('./dashboard/dashboard-home.routes').then(m => m.DASHBOARD_ROUTES) 
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.routes').then(m => m.CART_ROUTES)
  },

  {
    path: 'checkout',
    loadChildren: () =>
      import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES)
  },

  {
    path: 'sales',
    loadChildren: () =>
      import('./sales/sales.routes').then(m => m.SALES_ROUTES)
  },
{
    path: 'orders',
    loadChildren: () =>
      import('./orders/orders.routes').then(m => m.ORDERS_ROUTES)
  },
  { 
  path: 'catalogo', 
  loadChildren: () =>
    import('./catalogoCliente/catalogoC.routes')
      .then(m => m.CATALOGO_C_ROUTES)
},
{ path: '', redirectTo: 'reviewAdmin', pathMatch: 'full' }
];
  