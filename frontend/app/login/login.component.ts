import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "firebase/auth";

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string = "";
  email: string = "";
  password: string = "";

  auth: any;
  db: any;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    let app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, (user) => {
      if (user) this.router.navigate(['']);
    });
  }

  login() {
    this.http.post(environment.apiUrl + "getEmailFromUsername", {
      username: this.username
    }).subscribe((response: any) => {
      if (response.message != "OK") {
        alert(response.message);
        return;
      }
      this.email = response.email;
      signInWithEmailAndPassword(this.auth, this.email, this.password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          this.router.navigate(['']);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("error", errorCode, errorMessage);
          // ..
        });
    });
  }

}
