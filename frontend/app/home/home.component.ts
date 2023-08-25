import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    longModuleShown: boolean = localStorage.getItem('longModuleShown')
        ? localStorage.getItem('longModuleShown') == '1'
        : true;
    randomQuestion: any = localStorage.getItem('randomQuestion')
        ? JSON.parse(localStorage.getItem('randomQuestion') || '')
        : null;
    nextRandomQuestion: any;

    rankedUsers: any = [];

    constructor(private http: HttpClient, private authService: AuthService) {
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
            .post(environment.apiUrl + 'getTopUsersByElo', {})
            .subscribe((res: any) => {
                if (res.users) this.rankedUsers = res.users.slice(0, 7);
            });
        this.authService.onAuthStateChanged(
            this.authService.getAuth(),
            async (user) => {
                if (user) {
                    this.authService
                        .getCurrentUserInfo()
                        .subscribe((userObj: any) => {
                            this.userObj = userObj ? userObj : null;
                        });
                } else {
                    this.userObj = null;
                }
            }
        );
    }

    validatedAnswer(event: any) {
        if (this.userObj) {
            this.http
                .post(environment.apiUrl + 'updateQuestionStats', {
                    user_id: this.userObj._id,
                    question_id: this.randomQuestion._id,
                    answer_status: this.randomQuestion.answers[event].correct,
                })
                .subscribe((res: any) => {});
        }
        this.http
            .post(environment.apiUrl + 'getRandomQuestion', {})
            .subscribe((res: any) => {
                this.nextRandomQuestion = res.question;
                localStorage.setItem(
                    'randomQuestion',
                    JSON.stringify(res.question)
                );
            });
    }

    nextQuestion(event: any) {
        if (this.nextRandomQuestion) {
            this.randomQuestion = this.nextRandomQuestion;
            this.nextRandomQuestion = null;
        } else {
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
    }

    closeLongModule() {
        this.longModuleShown = false;
        localStorage.setItem('longModuleShown', '0');
    }
}
