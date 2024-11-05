import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LoaderComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isLoggedInSignal;
  public userSignal;
  public isModalVisible: boolean = false;
  public isLoading: boolean = false; // Loader state

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
    this.isLoading = true;
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
      this.closeModal();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
