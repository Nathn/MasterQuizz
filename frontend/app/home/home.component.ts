import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    availableThemes: any = localStorage.getItem('availableThemes')
        ? JSON.parse(localStorage.getItem('availableThemes') || '')
        : [];
    longModule1Shown: boolean = localStorage.getItem('longModule1Shown')
        ? localStorage.getItem('longModule1Shown') == '1'
        : true;
    longModule2Shown: boolean = localStorage.getItem('longModule2Shown')
        ? localStorage.getItem('longModule2Shown') == '1'
        : true;
    randomQuestion: any = localStorage.getItem('randomQuestion')
        ? JSON.parse(localStorage.getItem('randomQuestion') || '')
        : null;
    nextRandomQuestion: any;
    noMoreAllowedQuestions: boolean = false;
    waitingMessage: string = '';
    isLoadingThemes: boolean = true;

    rankedUsers: any = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private router: Router
    ) {
        if (this.availableThemes.length > 0) this.isLoadingThemes = false;
        if (this.userObj) {
            if (this.userObj.remainingQuestions <= 0) {
                this.noMoreAllowedQuestions = true;
                localStorage.setItem('remainingQuestions', '0');
                this.calculateRemainingTime();
            }
        } else {
            if (localStorage.getItem('remainingQuestions')) {
                if (
                    parseInt(
                        localStorage.getItem('remainingQuestions') || ''
                    ) <= 0
                )
                    this.noMoreAllowedQuestions = true;
            } else {
                localStorage.setItem('remainingQuestions', '6');
            }
        }
        if (!this.randomQuestion && !this.noMoreAllowedQuestions) {
            this.http
                .post(environment.apiUrl + 'getRandomQuestion', {
                    user_id: this.userObj ? this.userObj._id : null
                })
                .subscribe((res: any) => {
                    this.randomQuestion = res.question;
                    this.updateRemainingQuestions();
                    localStorage.setItem(
                        'randomQuestion',
                        JSON.stringify(res.question)
                    );
                });
        }
        this.http
            .post(environment.apiUrl + 'getAvailableThemes', {})
            .subscribe((res: any) => {
                if (res.themes) this.availableThemes = res.themes;
                this.isLoadingThemes = false;
                localStorage.setItem(
                    'availableThemes',
                    JSON.stringify(res.themes)
                );
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByElo', {})
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsers = res.users.slice(0, 7);
                    // for each user, call getCurrentDuelFromUser and add it to the user object
                    this.rankedUsers.forEach((user: any) => {
                        this.http
                            .post(
                                environment.apiUrl + 'getCurrentDuelFromUser',
                                {
                                    user: user._id
                                }
                            )
                            .subscribe((res: any) => {
                                if (res.match) {
                                    user.currentDuelId = res.match._id;
                                    if (
                                        this.userObj &&
                                        res.match.users.includes(
                                            this.userObj._id
                                        )
                                    ) {
                                        user.isCurrentDuelUser = true;
                                    } else {
                                        user.isCurrentDuelUser = false;
                                    }
                                }
                            });
                    });
                }
            });
        this.authService.onAuthStateChanged(
            this.authService.getAuth(),
            async (user) => {
                if (user) {
                    this.authService
                        .getCurrentUserInfo()
                        .subscribe((userObj: any) => {
                            this.userObj = userObj ? userObj : null;
                            if (this.userObj) {
                                this.noMoreAllowedQuestions =
                                    this.userObj.remainingQuestions <= 0;
                                if (this.noMoreAllowedQuestions) {
                                    this.calculateRemainingTime();
                                }
                            }
                        });
                } else {
                    this.userObj = null;
                }
            }
        );
    }

    openTheme(theme_id: string) {
        this.router.navigate([`/practice/theme/${theme_id}`]);
    }

    validatedAnswer(event: any) {
        if (this.userObj) {
            this.http
                .post(environment.apiUrl + 'updateQuestionStats', {
                    user_id: this.userObj._id,
                    question_id: this.randomQuestion._id,
                    answer_status: this.randomQuestion.answers[event].correct
                })
                .subscribe((res: any) => {});
        }
        this.http
            .post(environment.apiUrl + 'getRandomQuestion', {
                user_id: this.userObj ? this.userObj._id : null
            })
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
            this.updateRemainingQuestions();
            this.randomQuestion = this.nextRandomQuestion;
            this.nextRandomQuestion = null;
        } else {
            this.http
                .post(environment.apiUrl + 'getRandomQuestion', {
                    user_id: this.userObj ? this.userObj._id : null
                })
                .subscribe((res: any) => {
                    if (res.question) {
                        this.randomQuestion = res.question;
                        this.updateRemainingQuestions();
                        localStorage.setItem(
                            'randomQuestion',
                            JSON.stringify(res.question)
                        );
                    } else {
                        this.noMoreAllowedQuestions = true;
                    }
                });
        }
    }

    updateRemainingQuestions() {
        if (this.userObj) {
            this.http
                .post(environment.apiUrl + 'updateRemainingQuestions', {
                    userId: this.userObj._id,
                    remainingQuestions: this.userObj.remainingQuestions - 1
                })
                .subscribe((res: any) => {
                    if (res.userObj) {
                        this.userObj = res.userObj;
                        if (this.userObj.remainingQuestions <= 0) {
                            this.noMoreAllowedQuestions = true;
                            localStorage.setItem('remainingQuestions', '0');
                            this.calculateRemainingTime();
                        }
                    }
                });
        } else {
            localStorage.setItem(
                'remainingQuestions',
                (
                    parseInt(localStorage.getItem('remainingQuestions') || '') -
                    1
                ).toString()
            );
            if (parseInt(localStorage.getItem('remainingQuestions') || '') <= 0)
                this.noMoreAllowedQuestions = true;
        }
    }

    calculateRemainingTime() {
        let x = setInterval(() => {
            try {
                let now = new Date().getTime();
                let target = new Date(
                    this.userObj.timeBeforeQuestionRefill
                ).getTime();
                let distance = target - now;
                let hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                let minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                    this.waitingMessage = '';
                } else {
                    this.waitingMessage =
                        (hours < 10 ? '0' : '') +
                        hours +
                        ':' +
                        (minutes < 10 ? '0' : '') +
                        minutes +
                        ':' +
                        (seconds < 10 ? '0' : '') +
                        seconds;
                }
                if (distance < 0) {
                    clearInterval(x);
                    this.noMoreAllowedQuestions = false;
                    this.waitingMessage = '';
                    if (this.userObj.timeBeforeQuestionRefill) {
                        this.http
                            .post(
                                environment.apiUrl + 'updateRemainingQuestions',
                                {
                                    userId: this.userObj._id,
                                    remainingQuestions: 15
                                }
                            )
                            .subscribe((res: any) => {
                                if (res.userObj) {
                                    this.userObj = res.userObj;
                                }
                                this.userObj.remainingQuestions = 15;
                                this.nextQuestion(null);
                            });
                    }
                }
            } catch (e) {
                console.log(e);
                clearInterval(x);
            }
        }, 1000);
    }

    closeLongModule1() {
        this.longModule1Shown = false;
        localStorage.setItem('longModule1Shown', '0');
    }

    closeLongModule2() {
        this.longModule2Shown = false;
        localStorage.setItem('longModule2Shown', '0');
    }
}
