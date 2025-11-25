import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./catalogo/catalogo.component').then(m => m.default)
  },
  {
    path: 'agregar',
    loadComponent: () =>
      import('./agregar/agregar.component').then(m => m.default)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./editar/editar.component').then(m => m.default)
  },
  {
    path: 'eliminar/:id',
    loadComponent: () =>
      import('./eliminar/eliminar.component').then(m => m.default)
  },
] as Routes;
