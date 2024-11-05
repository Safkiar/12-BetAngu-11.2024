import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../../layout/loader/loader.component';

interface Bet {
  betOn: string;
  betVs: string;
  won: boolean | null;
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, CommonModule, LoaderComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent {
  // Main form fields
  betID: number;
  date: string;
  result: boolean | null;
  income: number | null;
  interest: number | null;
  totalBet: number | null;
  tax: number | null;
  totalWin: number;
  submissionError: string;
  isLoading: boolean = false;

  bets: Bet[];

  @ViewChild('betForm') betForm!: NgForm;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService
  ) {
    this.betID = Date.now();
    this.date = new Date().toISOString().substring(0, 10);
    this.result = null;
    this.income = null;
    this.interest = null;
    this.totalBet = null;
    this.tax = null;
    this.totalWin = 0;
    this.submissionError = '';
    this.bets = [
      {
        betOn: '',
        betVs: '',
        won: null,
      },
    ];
  }

  addBet() {
    const newBet: Bet = { betOn: '', betVs: '', won: null };
    if (this.result === true) {
      newBet.won = true;
    }
    this.bets.push(newBet);
  }

  removeBet(index: number) {
    if (this.bets.length > 1) {
      this.bets.splice(index, 1);
    }
  }

  onResultChange() {
    if (this.result === true) {
      this.bets.forEach((bet) => {
        bet.won = true;
      });
    } else if (this.result === false) {
      this.bets.forEach((bet) => {
        bet.won = null;
      });
    }
  }

  calculateTotalWin() {
    const taxValue = this.tax != null ? this.tax : 1;
    if (this.totalBet != null && this.interest != null) {
      this.totalWin = this.totalBet * this.interest * taxValue;
      this.totalWin = parseFloat(this.totalWin.toFixed(2));
    } else {
      this.totalWin = 0;
    }
    this.income = this.totalWin;
  }

  async submitForm() {
    this.isLoading = true;

    if (
      !this.date ||
      this.result === null ||
      this.income === null ||
      this.interest === null ||
      this.totalBet === null
    ) {
      this.submissionError = 'All main fields are required.';
      this.isLoading = false;
      return;
    }

    if (this.totalBet <= 0) {
      this.submissionError = 'Total Bet must be greater than 0.';
      this.isLoading = false;
      return;
    }
    if (this.interest < 1 || this.interest > 20) {
      this.submissionError = 'Interest must be between 1 and 20.';
      this.isLoading = false;
      return;
    }
    if (this.tax !== null && (this.tax < 0.1 || this.tax > 1)) {
      this.submissionError = 'Tax must be between 0.1 and 1.';
      this.isLoading = false;
      return;
    }

    for (const bet of this.bets) {
      if (!bet.betOn || !bet.betVs || bet.won === null) {
        this.submissionError = 'All bets must be fully specified.';
        this.isLoading = false;
        return;
      }
    }

    if (this.result === false) {
      const hasLostBet = this.bets.some((bet) => bet.won === false);
      if (!hasLostBet) {
        this.submissionError =
          'When the overall result is "Lost", at least one bet must be marked as "Lost".';
        this.isLoading = false;
        return;
      }
    }

    if (this.result === true) {
      const allBetsWon = this.bets.every((bet) => bet.won === true);
      if (!allBetsWon) {
        this.submissionError =
          'When the overall result is "Won", all bets must be marked as "Won".';
        this.isLoading = false;
        return;
      }
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.submissionError = 'User not authenticated.';
      this.isLoading = false;
      return;
    }
    const userId = user.uid;

    const allBets: { [key: string]: boolean } = {};
    for (const bet of this.bets) {
      const key = `${bet.betOn}-${bet.betVs}`;
      allBets[key] = bet.won!;
    }

    const betData = {
      AllBets: allBets,
      BetID: this.betID,
      Date: new Date(this.date),
      Income: this.result ? this.income : 0,
      Interest: this.interest,
      Result: this.result,
      TotalBet: this.totalBet,
      UserId: `/users/${userId}`,
    };

    try {
      await this.firestoreService.addBet(betData);
      await this.firestoreService.updateUserRanking(user, betData);

      this.betForm.resetForm();

      this.betID = Date.now();
      this.date = new Date().toISOString().substring(0, 10);
      this.result = null;
      this.income = null;
      this.interest = null;
      this.totalBet = null;
      this.tax = null;
      this.totalWin = 0;
      this.submissionError = '';
      this.bets = [
        {
          betOn: '',
          betVs: '',
          won: null,
        },
      ];

      Swal.fire({
        icon: 'success',
        title: 'Bet submitted successfully!',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error('Error submitting bet:', error);
      this.submissionError = 'Failed to submit bet. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
