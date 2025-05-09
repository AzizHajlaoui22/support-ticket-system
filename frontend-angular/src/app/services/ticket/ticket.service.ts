import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = "http://localhost:5000/api";

  constructor(private http: HttpClient) {}

  createTicket(title: string, description: string) {
    return this.http.post(`${this.apiUrl}/tickets`, { title, description });
  }
  
  getAllTickets() {
    return this.http.get(`${this.apiUrl}/tickets/all`);
  }

  getAssignedTickets() {
    return this.http.get(`${this.apiUrl}/tickets/assigned`);
  }

  getUserTickets() {
    return this.http.get(`${this.apiUrl}/tickets/my`);
  }

  deleteTicket(id: string) {
    return this.http.delete(`${this.apiUrl}/tickets/${id}`);
  }

  getTicketById(id: string) {
    return this.http.get(`${this.apiUrl}/tickets/${id}`);
  }
  
  assignTicket(id: string, agentId: string) {
    return this.http.put(`${this.apiUrl}/tickets/${id}/assign`, { agentId });
  }
  
  closeTicket(id: string) {
    return this.http.put(`${this.apiUrl}/tickets/${id}/close`, {});
  }
  
}
