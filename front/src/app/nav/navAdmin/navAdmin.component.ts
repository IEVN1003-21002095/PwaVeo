import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-nav-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navAdmin.component.html',
  styleUrls: ['./navAdmin.component.css']
})
export class NavAdminComponent implements OnInit {
  userName: string | null = null;
  showUserMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName');
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    this.showUserMenu = false;
    this.router.navigate(['/auth/login']);
  }
}
