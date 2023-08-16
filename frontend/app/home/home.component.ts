import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    user: any = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '')
        : null;
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    randomQuestion: any;
    rankedUsers: any = [];

    constructor(private http: HttpClient) {
        this.http
            .post(environment.apiUrl + 'getRandomQuestion', {})
            .subscribe((res: any) => {
                this.randomQuestion = res.question;
            });
        this.http
            .post(environment.apiUrl + 'getTopTenUsersByElo', {})
            .subscribe((res: any) => {
                if (res.users) this.rankedUsers = res.users.slice(0, 7);
            });
    }

    nextQuestion(event: any) {
        this.randomQuestion = null;
        this.http
            .post(environment.apiUrl + 'getRandomQuestion', {})
            .subscribe((res: any) => {
                this.randomQuestion = res.question;
            });
    }
}
