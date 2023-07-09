import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MasterQuizz';

  auth: any;

  user: any;
  isLoading: boolean = true;

  faSpinner = faSpinner;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    initializeApp(environment.firebaseConfig);
    this.auth = getAuth();
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
      this.isLoading = false;
    });
  }

  navigateToLogin() {
    this.router.navigate(['login']);
  }

  navigateToRegister() {
    this.router.navigate(['register']);
  }

  logout() {
    this.auth.signOut();
  }

}
