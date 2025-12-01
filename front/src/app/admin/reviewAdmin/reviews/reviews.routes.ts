import { Routes } from '@angular/router';
import { ReviewListComponent } from './review-list/review-list.component';
import { ReviewFormComponent } from './review-form/review-form.component';

export const REVIEWS_ROUTES: Routes = [
  { path: '', component: ReviewListComponent },
  { path: 'new', component: ReviewFormComponent }
];
