import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.services'; // Asegúrate que esta ruta sea correcta

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicialización del formulario
    this.formGroup = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      politica: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      // 1. Extraemos los valores
      const values = this.formGroup.value;

      // 2. Validar que las contraseñas coincidan manualmente
      if (values.password !== values.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      // 3. Preparamos el objeto para Flask (solo lo que el back necesita)
      const datosUsuario = {
        nombre: values.nombre,
        correo: values.correo,
        password: values.password
      };

      // 4. Enviar al Backend
      this.authService.register(datosUsuario).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          alert('¡Usuario registrado con éxito!');
          this.router.navigate(['/login']); // Redirigir al login
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          alert('Hubo un error al registrar el usuario. Revisa la consola.');
        }
      });

    } else {
      // Marcar todos los campos como tocados para mostrar errores visuales
      this.formGroup.markAllAsTouched();
      alert('Por favor completa todos los campos correctamente.');
    }
  }
}