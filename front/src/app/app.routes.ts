import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home/home.component').then(c => c.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'client',
    loadChildren: () =>
      import('./client/client.routes').then(m => m.CLIENT_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
