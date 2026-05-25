import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '@/services/auth';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
    ButtonModule,
    DividerModule,
    ProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private authService = inject(Auth);
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });
  // if these props aren't signals then setting them after a network request won't update the page immediately
  // don't ask why, I have no idea
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);

  async handleRegister() {
    const email = this.form.value.email;
    const password = this.form.value.password;
    if (!email || !password) return;

    this.hasError.set(false);
    this.isLoading.set(true);
    const result = await this.authService.registerUser(email, password);
    this.isLoading.set(false);
    if (result) this.router.navigateByUrl('/');
    else this.hasError.set(true);
  }

  handleGoogleLogin() {
    this.authService.loginUserWithGoogle();
  }
}
