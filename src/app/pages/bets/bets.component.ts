import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../auth/auth.service';
import { Bet } from '../../models/bet.model';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../layout/loader/loader.component';

@Component({
  selector: 'app-bets',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, LoaderComponent],
  templateUrl: './bets.component.html',
  styleUrls: ['./bets.component.scss'],
})
export class BetsComponent implements OnInit {
  bets$: Observable<Bet[]> | null = null;
  bets: Bet[] = [];
  error: string = '';
  isLoading: boolean = true;
  p: number = 1;
  itemsPerPage: number = 5;
  sortKey: string = '';
  sortDirection: boolean = true;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'User not authenticated.';
      this.isLoading = false;
      return;
    }

    this.bets$ = this.firestoreService.getUserBets(user.uid);

    this.bets$.subscribe(
      (bets) => {
        this.bets = bets;
        this.sortBets('Date');
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching bets:', error);
        this.error = 'Failed to load bets. Please try again.';
        this.isLoading = false;
      }
    );
  }

  getAllBetsKeys(allBets: { [key: string]: boolean }): string[] {
    return Object.keys(allBets);
  }

  formatBetKey(key: string): string {
    return key;
  }

  sortBets(key: string) {
    this.sortKey = key;
    this.sortDirection = !this.sortDirection;

    this.bets.sort((a: any, b: any) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === 'Date') {
        valueA = a.Date.toDate();
        valueB = b.Date.toDate();
      }

      if (valueA < valueB) {
        return this.sortDirection ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  deleteBet(bet: Bet) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this bet?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.isLoading = true;

        try {
          const user = this.authService.getCurrentUser();
          if (!user) {
            this.error = 'User not authenticated.';
            this.isLoading = false;
            return;
          }
          await this.firestoreService.deleteBet(bet.id, user);
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your bet has been deleted.',
            showConfirmButton: false,
            timer: 1500,
          });

          // Remove the deleted bet from the bets array
          this.bets = this.bets.filter((b) => b.id !== bet.id);
        } catch (error) {
          console.error('Error deleting bet:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete the bet.',
            showConfirmButton: true,
          });
        } finally {
          this.isLoading = false;
        }
      }
    });
  }
}
