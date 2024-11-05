import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../auth/auth.service';
import { Bet } from '../../models/bet.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../layout/loader/loader.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit, OnDestroy {
  totalBet: number = 0;
  numberOfWins: number = 0;
  numberOfLosses: number = 0;
  totalIncome: number = 0;
  totalLosses: number = 0;
  error: string = '';
  isLoading: boolean = true; // Add loading state
  private betsSubscription: Subscription | null = null;

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

    this.betsSubscription = this.firestoreService
      .getUserBets(user.uid)
      .subscribe(
        (bets) => {
          this.calculateStatistics(bets);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching bets:', error);
          this.error = 'Failed to load statistics. Please try again.';
          this.isLoading = false;
        }
      );
  }

  ngOnDestroy() {
    if (this.betsSubscription) {
      this.betsSubscription.unsubscribe();
    }
  }

  private calculateStatistics(bets: Bet[]) {
    this.totalBet = bets.reduce((sum, bet) => sum + (bet.TotalBet || 0), 0);
    this.numberOfWins = bets.filter((bet) => bet.Result === true).length;
    this.numberOfLosses = bets.filter((bet) => bet.Result === false).length;
    this.totalIncome = bets.reduce((sum, bet) => sum + (bet.Income || 0), 0);

    this.totalLosses = bets
      .filter((bet) => bet.Result === false)
      .reduce((sum, bet) => sum + (bet.TotalBet || 0), 0);
  }
}
