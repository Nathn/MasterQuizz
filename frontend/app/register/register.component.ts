import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  email: string = "";
  username: string = "";
  password: string = "";

  auth: any;

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

  register() {
    // check password length
    if (this.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    // check if all the info is valid through api
    this.http.post(environment.apiUrl + "validateRegister", {
      username: this.username,
      email: this.email
    }).subscribe((response: any) => {
      console.log("response", response);
      if (response.message != "OK") {
        alert(response.message);
        return;
      }
      createUserWithEmailAndPassword(this.auth, this.email, this.password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          console.log("user", user);
          // add username to user
          updateProfile(user, {
            displayName: this.username
          }).then(() => {
            // add user to database
            this.http.post(environment.apiUrl + "register", {
              username: this.username,
              email: this.email
            }).subscribe((response) => {
              console.log("response", response);
              this.router.navigate(['']);
            });
          }).catch((error) => {
            console.log("error", error);
          });
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
