import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
