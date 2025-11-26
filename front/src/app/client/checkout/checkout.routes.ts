import { Routes } from '@angular/router';
import { StepAddressComponent } from './step-address/step-address.component';
import { StepPaymentComponent } from './step-payment/step-payment.component';
import { StepSummaryComponent } from './step-summary/step-summary.component';

export const CHECKOUT_ROUTES: Routes = [
  { path: 'address', component: StepAddressComponent },
  { path: 'payment', component: StepPaymentComponent },
  { path: 'summary', component: StepSummaryComponent }
];
