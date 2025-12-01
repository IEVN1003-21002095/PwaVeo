import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ IMPORTANTE
import { NavClientComponent } from './nav/navClient/navClient.component';
import { NavAdminComponent } from './nav/navAdmin/navAdmin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,          // <- Para [(ngModel)]
    ReactiveFormsModule,  // <- Para Reactive Forms
    NavAdminComponent,
    NavClientComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  role: string = 'client';

  constructor(private router: Router) {
    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', (event) => {
      if (event.key === 'role' && event.newValue) {
        this.role = event.newValue;
      }
    });
  }

  ngOnInit(): void {
    this.updateRole();

    // Actualiza el rol en cada navegación, por si cambia después del login
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.updateRole();
      }
    });
  }

  private updateRole(): void {
    const savedRole = localStorage.getItem('role');
    this.role = savedRole || 'client';
  }
}
