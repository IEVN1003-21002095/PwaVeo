import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmContrasena: ['', Validators.required],
      aceptaTerminos: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  // Validación manual para contraseñas iguales
  passwordsMatchValidator(form: FormGroup) {
    const pass = form.get('contrasena')?.value;
    const confirm = form.get('confirmContrasena')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // =============== REGISTRO ===============
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const payload = {
      nombre: this.form.value.nombre,
      correo: this.form.value.correo,
      contrasena: this.form.value.contrasena
    };

    this.auth.register(payload).subscribe({
      next: (resp) => {
        this.loading = false;

        if (!resp.exito) {
          this.errorMsg = resp.mensaje;
          return;
        }

        this.successMsg = 'Cuenta creada con éxito. Redirigiendo...';

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error de conexión con el servidor.';
      }
    });
  }
}
