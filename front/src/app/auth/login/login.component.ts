import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.services'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.formGroup = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // 👇 FUNCIÓN SEGURA PARA IR AL REGISTRO
  irAlRegistro() {
    this.router.navigate(['/auth/sign-in']);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const credentials = this.formGroup.value;

      const loginData = {
        email: credentials.correo, 
        password: credentials.password
      };

      this.authService.login(loginData).subscribe({
        next: (response: any) => { // 'any' para acceder a las propiedades dinámicas
          console.log('Login exitoso:', response);
          
          // 1. Guardamos el token
          if(response.token) {
            localStorage.setItem('auth_token', response.token);
            // Opcional: Guardar usuario para mostrar nombre en navbar
            localStorage.setItem('user_data', JSON.stringify(response.usuario));
          }

          // 2. 👇 LÓGICA DE REDIRECCIÓN POR ROL (Criterios #2 y #9)
          const rol = response.usuario?.rol?.toLowerCase(); // Normalizamos a minúsculas

          if (rol === 'admin' || rol === 'administrador') {
            // Si es admin, va al dashboard de gestión
            this.router.navigate(['/admin/dashboard']); 
          } else {
            // Si es cliente/comprador, va al catálogo
            this.router.navigate(['/catalogo']);
          }

        },
        error: (error) => {
          console.error('Error de login:', error);
          alert('Credenciales incorrectas o usuario no encontrado.');
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
      alert('Por favor revisa que el correo y contraseña estén escritos.');
    }
  }
}