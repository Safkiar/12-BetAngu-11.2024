import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AuthService } from '../../auth/auth.service';
import { FormComponent } from '../form/form.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormComponent, NgClass],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  showForm = false;
  initialState = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleForm() {
    this.initialState = true;
    this.showForm = !this.showForm;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
