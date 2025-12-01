import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WelcomeDialogComponent } from '../welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WelcomeDialogComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMsg = '';
  loading = false;
  showWelcomeDialog = false;
  userName = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMsg = 'Por favor completa todos los campos correctamente.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const credentials = {
      email: this.loginForm.value.correo,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loading = false;
        
        if (response && response.success) {
          // Guardar datos de sesión
          localStorage.setItem('token', response.token || '');
          localStorage.setItem('userId', response.usuario_id || '');
          localStorage.setItem('role', response.rol || 'client');
          localStorage.setItem('userName', response.nombre || '');

          // Mostrar diálogo de bienvenida
          this.userName = response.nombre || 'Usuario';
          this.showWelcomeDialog = true;

          // Redirigir después de cerrar el diálogo
          setTimeout(() => {
            if (response.rol === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/client/catalogo']);
            }
          }, 2000);
        } else {
          this.errorMsg = response.mensaje || 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.loading = false;
        this.errorMsg = err?.error?.mensaje || 'Error de conexión con el servidor';
      }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/auth/sign-in']);
  }

  onDialogClosed(): void {
    this.showWelcomeDialog = false;
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/client/catalogo']);
    }
  }
}
