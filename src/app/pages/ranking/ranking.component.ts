import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../layout/loader/loader.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule, LoaderComponent],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
})
export class RankingComponent implements OnInit {
  rankings$: Observable<any[]> | null = null;
  rankings: any[] = [];
  error: string = '';
  isLoading: boolean = false;
  p: number = 1;
  itemsPerPage: number = 5;
  sortKey: string = '';
  sortDirection: boolean = true;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.fetchRankings();
  }

  fetchRankings() {
    this.isLoading = true;
    this.rankings$ = this.firestoreService.getAllUserRankings().pipe(
      map((rankings) => {
        rankings.forEach((ranking) => {
          const totalGames = ranking.Wins + ranking.Lost;
          ranking.WinRatio =
            totalGames > 0 ? (ranking.Wins / totalGames) * 100 : 0;
        });

        if (this.sortKey) {
          rankings.sort((a, b) => {
            let valueA = a[this.sortKey];
            let valueB = b[this.sortKey];

            if (valueA < valueB) {
              return this.sortDirection ? -1 : 1;
            } else if (valueA > valueB) {
              return this.sortDirection ? 1 : -1;
            } else {
              return 0;
            }
          });
        } else {
          rankings.sort((a, b) => b.Income - a.Income);
        }

        return rankings;
      })
    );

    this.rankings$.subscribe(
      (rankings) => {
        this.rankings = rankings;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching rankings:', error);
        this.error = 'Failed to load rankings. Please try again.';
        this.isLoading = false;
      }
    );
  }

  sortRankings(key: string) {
    this.sortKey = key;
    this.sortDirection = !this.sortDirection;
    this.fetchRankings();
  }
}
