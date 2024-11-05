import { Injectable, signal } from '@angular/core';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedInSignal = signal<boolean>(false);
  public userSignal = signal<FirebaseUser | null>(null);

  private authStateResolved: boolean = false;

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSignal.set(user);
      this.isLoggedInSignal.set(!!user);
      this.authStateResolved = true;
    });
  }

  // Method to check if user is logged in synchronously
  public isLoggedIn(): boolean {
    return this.isLoggedInSignal();
  }

  // Method to check if user is logged in asynchronously
  public async isLoggedInAsync(): Promise<boolean> {
    if (this.authStateResolved) {
      return this.isLoggedIn();
    } else {
      return new Promise<boolean>((resolve) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          this.userSignal.set(user);
          this.isLoggedInSignal.set(!!user);
          this.authStateResolved = true;
          resolve(!!user);
          unsubscribe();
        });
      });
    }
  }

  public getCurrentUser(): FirebaseUser | null {
    return this.userSignal();
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  public async registerUser(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}
