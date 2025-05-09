import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:5000/api";

  constructor(private http: HttpClient) {}

  getAgents() {
    return this.http.get(`${this.apiUrl}/users?role=agent`);
  }
}
