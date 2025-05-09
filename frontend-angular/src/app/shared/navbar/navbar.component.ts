import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  role: string = '';

  constructor(private auth: AuthService) {
    this.role = this.auth.getUserRole() ?? '';
  }

  logout() {
    this.auth.logout();
  }
}
