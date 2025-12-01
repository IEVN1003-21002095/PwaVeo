// src/app/orders/orders.routes.ts

import { Routes } from '@angular/router';
import { OrderDetailComponent } from './order-detail.component'; 

export const ORDERS_ROUTES: Routes = [
  {
    path: '', 
    component: OrderDetailComponent 
  }
];