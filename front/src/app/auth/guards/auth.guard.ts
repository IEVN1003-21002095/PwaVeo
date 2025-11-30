import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Inyectamos el Router para poder redirigir
  const router = inject(Router);
  
  // 1. Buscamos el token en el almacenamiento local
  // (Este token lo guardamos en el login.component.ts)
  const token = localStorage.getItem('auth_token');

  if (token) {
    // ✅ Si hay token, dejamos pasar al usuario
    return true;
  } else {
    // ⛔ Si NO hay token, lo mandamos al login
    router.navigate(['/login']);
    return false;
  }
};