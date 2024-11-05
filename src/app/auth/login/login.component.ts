import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { VideoComponent } from '../../layout/video/video.component';
import { LoaderComponent } from '../../layout/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    VideoComponent,
    LoaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loginError = '';

  isLoading = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);

  async login(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.loginError = 'User not found.';
      } else if (error.code === 'auth/wrong-password') {
        this.loginError = 'Incorrect password.';
      } else {
        this.loginError = 'Login failed. Please try again.';
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
