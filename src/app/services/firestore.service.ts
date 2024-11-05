import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  deleteDoc,
} from '@angular/fire/firestore';
import { Bet } from '../models/bet.model';
import { Observable } from 'rxjs';
import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Add a new bet
  async addBet(betData: any): Promise<void> {
    try {
      const betsCollection = collection(this.firestore, 'GlobalBets');
      await addDoc(betsCollection, betData);
    } catch (error) {
      console.error('Error adding bet to Firestore:', error);
      throw error;
    }
  }

  // Get bets for a user
  getUserBets(userId: string): Observable<Bet[]> {
    const betsCollection = collection(this.firestore, 'GlobalBets');
    const q = query(betsCollection, where('UserId', '==', `/users/${userId}`));
    return collectionData(q, { idField: 'id' }) as Observable<Bet[]>;
  }

  // Update user's ranking data after adding a bet
  async updateUserRanking(user: FirebaseUser, betData: any): Promise<void> {
    try {
      const userId = user.uid;
      const userRankingDocRef = doc(this.firestore, 'UsersRanking', userId);

      // Determine increment values based on the new bet
      const totalBetIncrement = betData.TotalBet || 0;
      const incomeIncrement = betData.Income || 0;
      const winsIncrement = betData.Result === true ? 1 : 0;
      const lossesIncrement = betData.Result === false ? 1 : 0;

      // Prepare update data
      const updateData = {
        UserId: `/users/${userId}`,
        name: user.email?.split('@')[0], // Extract name from email
        Total: increment(totalBetIncrement),
        Income: increment(incomeIncrement),
        Wins: increment(winsIncrement),
        Lost: increment(lossesIncrement),
        lastUpdated: Timestamp.now(),
      };

      // Check if the document exists
      const docSnapshot = await getDoc(userRankingDocRef);
      if (docSnapshot.exists()) {
        // Update existing document
        await updateDoc(userRankingDocRef, updateData);
      } else {
        // Create new document
        await setDoc(userRankingDocRef, {
          UserId: `/users/${userId}`,
          name: user.email?.split('@')[0],
          Total: totalBetIncrement,
          Income: incomeIncrement,
          Wins: winsIncrement,
          Lost: lossesIncrement,
          lastUpdated: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error updating user ranking:', error);
      throw error;
    }
  }

  // Delete a bet and update user rankings
  async deleteBet(betId: string, user: FirebaseUser): Promise<void> {
    try {
      // Get bet document reference
      const betDocRef = doc(this.firestore, 'GlobalBets', betId);
      // Get the bet data
      const betSnapshot = await getDoc(betDocRef);
      if (!betSnapshot.exists()) {
        throw new Error('Bet does not exist.');
      }
      const betData = betSnapshot.data();

      // Delete the bet
      await deleteDoc(betDocRef);

      // Update user ranking data
      await this.updateUserRankingAfterBetDeletion(user, betData);
    } catch (error) {
      console.error('Error deleting bet:', error);
      throw error;
    }
  }

  // Update user's ranking data after deleting a bet
  async updateUserRankingAfterBetDeletion(
    user: FirebaseUser,
    betData: any
  ): Promise<void> {
    try {
      const userId = user.uid;
      const userRankingDocRef = doc(this.firestore, 'UsersRanking', userId);

      // Determine decrement values based on the deleted bet
      const totalBetDecrement = betData.TotalBet || 0;
      const incomeDecrement = betData.Income || 0;
      const winsDecrement = betData.Result === true ? 1 : 0;
      const lossesDecrement = betData.Result === false ? 1 : 0;

      // Prepare update data
      const updateData = {
        Total: increment(-totalBetDecrement),
        Income: increment(-incomeDecrement),
        Wins: increment(-winsDecrement),
        Lost: increment(-lossesDecrement),
        lastUpdated: Timestamp.now(),
      };

      // Update existing document
      await updateDoc(userRankingDocRef, updateData);
    } catch (error) {
      console.error('Error updating user ranking after bet deletion:', error);
      throw error;
    }
  }

  // Get all user rankings
  getAllUserRankings(): Observable<any[]> {
    const rankingsCollection = collection(this.firestore, 'UsersRanking');
    return collectionData(rankingsCollection, { idField: 'id' });
  }
}
