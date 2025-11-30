import { Routes } from '@angular/router';
import { DetallesComponent } from './detalles/detalles.component';
import { CatalogoClienteComponent } from './catalogo-c/catalogo-c.component';

export const CATALOGO_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: CatalogoClienteComponent,
    title: 'Catálogo de Productos'
  },
  {
    path: ':id',
    component: DetallesComponent,
    title: 'Detalle de Producto'
  }
];
