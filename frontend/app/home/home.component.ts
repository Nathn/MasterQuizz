import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  randomQuestion: any;

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private http: HttpClient
  ) {
    this.http.post(environment.apiUrl + "getRandomQuestion", {}).subscribe((res: any) => {
      this.randomQuestion = res.question[0];
    });
  }

  quizzFinished(event: any) {
    this.http.post(environment.apiUrl + "getRandomQuestion", {}).subscribe((res: any) => {
      this.randomQuestion = res.question;
    });
  }

}
