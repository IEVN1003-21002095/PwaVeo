import { Routes } from '@angular/router';
import { StockListComponent } from './stock-list/stock-list.component';
import { StockEditComponent } from './stock-edit/stock-edit.component';

export const STOCK_ROUTES: Routes = [
  { path: '', component: StockListComponent },
  { path: ':id', component: StockEditComponent }
];
