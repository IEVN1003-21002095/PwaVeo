import { Routes } from '@angular/router';
import { CatalogoClienteComponent } from './catalogoCliente/catalogo-c/catalogo-c.component';

export const routes: Routes = [
  // 1. RUTA DE HOME (Ruta Raíz: '/')
  {
    path: '', // Esta será la ruta por defecto (ej: http://localhost:4200/)
    loadComponent: () =>
      import('./home/home/home.component').then(m => m.HomeComponent)
  },
  
  // Rutas de Módulos (Carga perezosa)
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'catalogo',
    loadChildren: () =>
      import('./catalogoCliente/catalogo-cliente.routes').then(
        m => m.CATALOGO_CLIENTE_ROUTES
      )
  },

  // Gestión de Catálogo
  {
    path: 'gestionCatalogo',
    loadChildren: () =>
      import('./gestionCatalogo/gestionCatalogo.routes')
        .then(m => m.GESTION_CATALOGO_ROUTES)
  },

  // Gestión de Stock
  {
    path: 'gestionStock',
    loadChildren: () =>
      import('./gestionStock/inventario.routes')
        .then(m => m.GESTION_INVENTARIO_ROUTES)
  },

  // Detalle de producto dentro del catálogo
  {
    path: 'catalogo/producto/:id',
    loadComponent: () =>
      import('./catalogoCliente/detalles/detalles.component')
        .then(m => m.DetallesComponent)
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

  // 2. Ruta Wildcard (para manejar páginas no encontradas)
  // Ahora que 'home' maneja el path: '', usamos '**' para 404
  { path: '**', redirectTo: 'catalogo' }
];