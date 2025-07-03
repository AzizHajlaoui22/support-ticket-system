import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ticket-card',
  templateUrl: './ticket-card.component.html'
})
export class TicketCardComponent {
  @Input() ticket: any;
  @Input() userRole: string = '';
  @Output() delete = new EventEmitter<string>();

  onDelete() {
    if (confirm('⚠️ Es-tu sûr de vouloir supprimer ce ticket ?')) {
      this.delete.emit(this.ticket._id);
      // dotnet : this.delete.emit(this.ticket.id);
    }
  }
}
