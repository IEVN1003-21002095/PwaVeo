import { Routes } from '@angular/router';
import { CatalogoClienteComponent } from './catalogo-c/catalogo-c.component';
import { DetallesComponent } from './detalles/detalles.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const CATALOGO_CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: CatalogoClienteComponent
  },
  {
    path: 'detalles/:id',
    component: DetallesComponent
  },
  {
    path: 'producto/:id',
    component: ProductDetailComponent
  }
];
