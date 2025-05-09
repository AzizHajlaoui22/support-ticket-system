import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html'
})
export class CreateTicketComponent {
  ticketForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.ticketForm.invalid) return;

    const { title, description } = this.ticketForm.value;

    this.ticketService.createTicket(title, description).subscribe({
      next: () => {
        alert('🎉 Ticket créé avec succès !');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert('❌ Erreur lors de la création du ticket.');
      }
    });
  }
}
