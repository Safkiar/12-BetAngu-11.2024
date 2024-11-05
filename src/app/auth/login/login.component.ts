import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { VideoComponent } from '../../layout/video/video.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, VideoComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loginError = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login(event: Event) {
    event.preventDefault();
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
    }
  }
}
