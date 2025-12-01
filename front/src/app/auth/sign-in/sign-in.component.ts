import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.services'; 

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
    // Inicialización del formulario con validaciones actualizadas
    this.formGroup = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      // 👇 ACTUALIZADO: Se agrega minLength(8) para cumplir el criterio
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      politica: [false, Validators.requiredTrue]
    });
  }

  // 👇 FUNCIÓN SEGURA PARA NAVEGAR
  irAlLogin() {
    this.router.navigate(['/auth/login']);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const values = this.formGroup.value;

      if (values.password !== values.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      // Preparamos los datos
      const datosUsuario = {
        nombre: values.nombre,
        email: values.correo, 
        password: values.password
      };

      this.authService.register(datosUsuario).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          alert('¡Usuario registrado con éxito!');
          // 👇 Redirección correcta a la ruta padre 'auth'
          this.router.navigate(['/auth/login']); 
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          alert('Hubo un error al registrar. Revisa la consola.');
        }
      });

    } else {
      this.formGroup.markAllAsTouched();
      alert('Por favor completa todos los campos correctamente.');
    }
  }
}