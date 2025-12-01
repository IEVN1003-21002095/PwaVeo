import { Routes } from '@angular/router';
import { ReviewAdminComponent } from './reviewAdmin.component';
import { ReviewUserComponent } from './reviewUser.component'; // Importar el nuevo componente

export const REVIEW_ROUTES: Routes = [
  { path: '', component: ReviewAdminComponent },     // Ruta base (Admin)
  { path: 'user', component: ReviewUserComponent }   // Ruta nueva (Usuario) -> /reviews/new
];