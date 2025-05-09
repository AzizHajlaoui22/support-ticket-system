import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  templateUrl: './role-badge.component.html'
})
export class RoleBadgeComponent {
  @Input() role: string = '';

  get badgeClass(): string {
    switch (this.role) {
      case 'admin':
        return 'bg-danger';
      case 'agent':
        return 'bg-primary';
      case 'user':
        return 'bg-secondary';
      default:
        return 'bg-dark';
    }
  }

  get label(): string {
    switch (this.role) {
      case 'admin':
        return 'Admin';
      case 'agent':
        return 'Agent';
      case 'user':
        return 'Utilisateur';
      default:
        return this.role;
    }
  }
}
