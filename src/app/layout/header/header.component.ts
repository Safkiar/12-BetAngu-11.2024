import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isLoggedInSignal;
  public userSignal;
  public isModalVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedInSignal = this.authService.isLoggedInSignal;
    this.userSignal = this.authService.userSignal;
  }

  public openModal() {
    this.isModalVisible = true;
  }

  public closeModal() {
    this.isModalVisible = false;
  }

  public async confirmLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
      this.closeModal();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
  public isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
