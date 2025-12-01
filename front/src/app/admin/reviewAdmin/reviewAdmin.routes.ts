import { Routes } from '@angular/router';
import { ReviewAdminComponent } from './reviewAdmin.component';
import { ReviewUserComponent } from './reviewUser.component';

export const REVIEW_ADMIN_ROUTES: Routes = [
  { path: '', component: ReviewAdminComponent },     // Ruta base (Admin) -> /admin/reviews
  { path: 'new', component: ReviewUserComponent }    // Crear reseña -> /admin/reviews/new
];