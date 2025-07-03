import { Component, OnInit } from '@angular/core';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  tickets: any[] = [];
  role: string = '';
  user: any;
  dashboardTitle: string = 'Mes Tickets';

  constructor(
    private ticketService: TicketService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getUserRole()?? '';
    console.log("🧠 Rôle extrait du token dans ngOnInit :", this.role);
    
    this.loadTickets(); // centraliser la logique ici
    
  }

  loadTickets(): void {
    console.log("📌 Chargement des tickets pour le rôle :", this.role);
    if (this.role === 'admin') {
      this.ticketService.getAllTickets().subscribe({
        next: res => this.tickets = res as any[],

        error: () => alert('Erreur lors du chargement des tickets')
      });
    } else if (this.role === 'agent') {
      this.ticketService.getAssignedTickets().subscribe({
        next: res => this.tickets = res as any[],

        error: () => alert('Erreur lors du chargement des tickets')
      });
    } else {
      this.ticketService.getUserTickets().subscribe({
        next: res => this.tickets = res as any[],

        error: () => alert('Erreur lors du chargement des tickets')
      });
    }
  }

  deleteTicket(id: string): void {
    if (confirm('⚠️ Es-tu sûr de vouloir supprimer ce ticket ?')) {
      this.ticketService.deleteTicket(id).subscribe({
        next: () => {
          alert('✅ Ticket supprimé !');
          this.tickets = this.tickets.filter(t => t._id !== id);
        },
        error: err => alert('❌ Erreur suppression : ' + (err.error?.message || 'échec'))
      });
    }
  }

  goToDetails(id: string): void {
    this.router.navigate(['/ticket', id]);
  }

 
}

