import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MasterQuizz';
  backendUrl: string = `http://${window.location.hostname}:3000/`;
  ping: string = '';
  got_title: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.pingServer();
  }

  pingServer() {
    this.http.get(this.backendUrl + 'ping').subscribe((res: any) => {
      this.ping = res.message;
    });
  }

}
