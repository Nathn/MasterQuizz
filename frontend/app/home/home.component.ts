import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';

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
    longModuleShown: boolean = localStorage.getItem('longModuleShown')
        ? localStorage.getItem('longModuleShown') == '1'
        : true;
    randomQuestion: any = localStorage.getItem('randomQuestion')
        ? JSON.parse(localStorage.getItem('randomQuestion') || '')
        : null;

    rankedUsers: any = [];

    faCircleXmark = faCircleXmark;

    constructor(private http: HttpClient) {
        if (!this.randomQuestion) {
            this.http
                .post(environment.apiUrl + 'getRandomQuestion', {})
                .subscribe((res: any) => {
                    this.randomQuestion = res.question;
                    localStorage.setItem(
                        'randomQuestion',
                        JSON.stringify(res.question)
                    );
                });
        }
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
                localStorage.setItem(
                    'randomQuestion',
                    JSON.stringify(res.question)
                );
            });
    }

    closeLongModule() {
        this.longModuleShown = false;
        localStorage.setItem('longModuleShown', '0');
    }
}
