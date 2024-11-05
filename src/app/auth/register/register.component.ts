import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { VideoComponent } from '../../layout/video/video.component';
import { LoaderComponent } from '../../layout/loader/loader.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    VideoComponent,
    LoaderComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  passwordMismatch = false;
  registrationError = '';

  isLoading = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  async register(form: any) {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    } else {
      this.passwordMismatch = false;
    }

    this.isLoading.set(true);

    try {
      await this.authService.registerUser(
        this.email,
        this.password,
        this.username
      );
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.registrationError = 'Email is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        this.registrationError = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        this.registrationError = 'Password is too weak.';
      } else {
        this.registrationError = 'Registration failed. Please try again.';
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
