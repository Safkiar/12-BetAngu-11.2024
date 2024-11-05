import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { VideoComponent } from '../../layout/video/video.component';
import { LoaderComponent } from "../../layout/loader/loader.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, VideoComponent, LoaderComponent],
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
      // Handle login error
      this.loginError = error.message;
    }
  }
}
