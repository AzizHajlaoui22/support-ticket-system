import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:5000/api";


  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(name: string, email: string, password: string, role: string) {
    return this.http.post(`${this.apiUrl}/auth/register`, { name, email, password, role });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

 
 //version node.js
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("🔍 Payload JWT :", payload);
    return payload.role;
  }
  
  /*
 version .net
 getUserRole(): string | null {
  const token = this.getToken();
  if (!token) return null;

  const payloadEncoded = token.split('.')[1];
  try {
    const payload = JSON.parse(atob(payloadEncoded));
    console.log("🔍 Payload JWT :", payload);
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  } catch (e) {
    console.error("❌ Erreur de décodage du token :", e);
    return null;
  }
}
  */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
