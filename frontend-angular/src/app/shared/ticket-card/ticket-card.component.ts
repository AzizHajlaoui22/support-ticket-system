import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ticket-card',
  templateUrl: './ticket-card.component.html'
})
export class TicketCardComponent {
  //@Input() vient d’Angular et rend la variable accessible depuis le HTML du parent.
  @Input() ticket: any;
  @Input() userRole: string = '';
  //✅ Envoyer des infos au parent → grâce à @Output()
  @Output() delete = new EventEmitter<string>();

  onDelete() {
    if (confirm('⚠️ Es-tu sûr de vouloir supprimer ce ticket ?')) {
      this.delete.emit(this.ticket._id);
    }
  }
}
