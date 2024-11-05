import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { VideoComponent } from '../../layout/video/video.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, VideoComponent],
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

  constructor(private authService: AuthService, private router: Router) {}

  async register(form: any) {
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    } else {
      this.passwordMismatch = false;
    }

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
    }
  }
}
