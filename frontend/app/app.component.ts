import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner, faSignInAlt, faUserPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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

  user: any = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : null;
  userObj: any = localStorage.getItem("userObj") ? JSON.parse(localStorage.getItem("userObj") || "") : null;
  isLoading: boolean = localStorage.getItem("user") ? false : true;

  faSpinner = faSpinner;
  faSignInAlt = faSignInAlt;
  faUserPlus = faUserPlus;
  faSignOutAlt = faSignOutAlt;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    if (this.user) {
      this.getUserInfo();
    }
    initializeApp(environment.firebaseConfig);
    this.auth = getAuth();
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
        localStorage.setItem("user", JSON.stringify(user));
        this.getUserInfo();
      } else {
        this.user = null;
      }
      this.isLoading = false;
    });
  }

  getUserInfo() {
    this.http.post(environment.apiUrl + "getUserFromEmail", {
      email: this.user.email
    }).subscribe((response: any) => {
      if (response.message != "OK") {
        alert(response.message);
      } else {
        this.userObj = response.user;
        localStorage.setItem("userObj", JSON.stringify(response.user));
      }
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
