import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html'
})
export class TicketDetailsComponent implements OnInit {
  ticket: any;
  role: string | null = null;
  agents: any[] = [];
  agentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (!ticketId) return;

    this.role = this.authService.getUserRole();

    this.ticketService.getTicketById(ticketId).subscribe({
      next: (res: any) => {
        this.ticket = res;
        if (this.role === 'admin') {
          this.loadAgents();
        }
      },
      error: () => alert("❌ Erreur lors du chargement du ticket")
    });
  }

  loadAgents() {
    this.userService.getAgents().subscribe({
      next: (res: any) => this.agents = res,
      error: () => alert("❌ Erreur chargement agents")
    });
  }

  assign() {
    if (!this.agentId) return;

    this.ticketService.assignTicket(this.ticket._id, this.agentId).subscribe({
      next: () => {
        alert("🎯 Ticket assigné !");
        this.router.navigate(['/dashboard']);
      },
      error: () => alert("❌ Erreur lors de l'assignation")
    });
  }

  close() {
    this.ticketService.closeTicket(this.ticket._id).subscribe({
      next: () => {
        alert("✅ Ticket clôturé !");
        this.router.navigate(['/dashboard']);
      },
      error: () => alert("❌ Erreur lors de la clôture")
    });
  }
}
