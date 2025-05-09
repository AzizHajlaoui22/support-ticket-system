import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['user', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { name, email, password, role } = this.registerForm.value;
    console.log("Formulaire soumis :", this.registerForm.value);

    this.authService.register(name, email, password, role).subscribe({
      next: (res) => {
        console.log("✅ Inscription réussie :", res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'inscription :", err);
        this.errorMessage = err.error?.message || "Erreur d'inscription.";
      }
    });
  }
}
