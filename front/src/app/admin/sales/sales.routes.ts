import { Routes } from '@angular/router';
import { SalesListComponent } from './sales-list/sales-list.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';

export const SALES_ROUTES: Routes = [
  { path: '', component: SalesListComponent },
  { path: ':id', component: SalesDetailComponent }
];
