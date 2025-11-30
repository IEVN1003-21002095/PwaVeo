import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 1. CAMBIO CLAVE: Apuntar al puerto 5000 y al prefijo del blueprint
  private apiUrl = 'http://127.0.0.1:5000/api/auth'; 

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    // Esto llamará a: http://127.0.0.1:5000/api/auth/register
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    // Esto llamará a: http://127.0.0.1:5000/api/auth/login
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}