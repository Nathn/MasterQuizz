import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MasterQuizz';
  backendUrl: string = `http://${window.location.hostname}:3000/`;
  ping: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    initializeApp(environment.firebaseConfig);
    this.pingServer();
  }

  pingServer() {
    this.http.get(this.backendUrl + 'ping').subscribe((res: any) => {
      this.ping = res.message;
    });
  }

}
