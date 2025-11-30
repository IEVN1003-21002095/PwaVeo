import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.services';

@Component({
  selector: 'app-login', // <--- CAMBIO IMPORTANTE: Selector correcto
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html', // <--- CAMBIO IMPORTANTE: Apunta al HTML de login
  styleUrls: ['./login.component.css']   // <--- CAMBIO IMPORTANTE: Apunta al CSS de login
})
export class LoginComponent { // <--- CAMBIO IMPORTANTE: Nombre de clase correcto
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

  onSubmit() {
    if (this.formGroup.valid) {
      const credentials = this.formGroup.value;

      // Mapeo seguro por si el back espera 'email'
      const loginData = {
        email: credentials.correo, 
        password: credentials.password
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Redirigir al catálogo
          this.router.navigate(['/catalogo']); 
        },
        error: (error) => {
          console.error('Error de login:', error);
          alert('Credenciales incorrectas');
        }
      });
    } else {
      this.formGroup.markAllAsTouched();
      alert('Revisa los campos');
    }
  }
}