import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-nav-client',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navClient.component.html',
  styleUrls: ['./navClient.component.css']
})
export class NavClientComponent implements OnInit {
  userName: string | null = null;
  isLoggedIn = false;
  showUserMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    this.userName = localStorage.getItem('userName');
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    this.isLoggedIn = false;
    this.userName = null;
    this.showUserMenu = false;
    this.router.navigate(['/auth/login']);
  }
}
