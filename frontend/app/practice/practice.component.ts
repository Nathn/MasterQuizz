import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-practice',
    templateUrl: './practice.component.html',
    styleUrls: ['./practice.component.scss']
})
export class PracticeComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    difficultyImages: any = {
        1: 'assets/images/difficulties/1.jpg',
        2: 'assets/images/difficulties/2.jpg',
        3: 'assets/images/difficulties/3.jpg',
        4: 'assets/images/difficulties/4.jpg',
        5: 'assets/images/difficulties/5.jpg'
    };
    difficultyNames: any = {
        1: 'Très facile',
        2: 'Facile',
        3: 'Moyen',
        4: 'Difficile',
        5: 'Très difficile'
    };

    isLoading: boolean = true;
    isLoadingThemes: boolean = true;
    isLoadingDifficulties: boolean = true;
    availableThemes: any = [];
    availableDifficulties: any = [];

    trainingView: boolean = false;
    mode: string = '';
    id: string = '';

    questions: any = [];
    answers: any = [];
    score: number = 0;
    status: string = '';
    currentQuestionIndex: number = 0;
    selectedAnswerIndex: number = -1;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.ar.params.subscribe((params) => {
            if (params['mode'] && !params['id'])
                this.router.navigate(['/practice']);
            if (
                params['mode'] &&
                params['id'] &&
                !['theme', 'difficulty'].includes(params['mode'])
            )
                this.router.navigate(['/practice']);
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
            if (!params['mode']) {
                this.http
                    .post(environment.apiUrl + 'getAvailableThemes', {})
                    .subscribe((res: any) => {
                        if (res.themes) this.availableThemes = res.themes;
                        this.isLoadingThemes = false;
                    });
                this.http
                    .post(environment.apiUrl + 'getAvailableDifficulties', {})
                    .subscribe((res: any) => {
                        if (res.difficulties)
                            this.availableDifficulties = res.difficulties;
                        this.isLoadingDifficulties = false;
                    });
            }
            if (params['mode'] && params['id']) {
                this.id = params['id'];
                this.questions = localStorage.getItem(
                    `questions-${params['id']}`
                )
                    ? JSON.parse(
                          localStorage.getItem(`questions-${params['id']}`) ||
                              ''
                      )
                    : [];
                this.answers = localStorage.getItem(`answers-${params['id']}`)
                    ? JSON.parse(
                          localStorage.getItem(`answers-${params['id']}`) || ''
                      )
                    : [];
                this.currentQuestionIndex = this.answers.length;
                console.log(this.currentQuestionIndex);
                if (params['mode'] == 'theme') {
                    this.trainingView = true;
                    this.mode = 'theme';
                    if (!this.questions || !this.answers) {
                        this.http
                            .post(
                                environment.apiUrl + 'getPracticeQuizzByTheme',
                                {
                                    theme: params['id']
                                }
                            )
                            .subscribe((res: any) => {
                                if (res.message != 'OK' || !res.questions) {
                                    console.error(res.message);
                                    this.router.navigate(['/practice']);
                                } else {
                                    this.questions = res.questions;
                                    localStorage.setItem(
                                        `questions-${params['id']}`,
                                        JSON.stringify(res.questions)
                                    );
                                    this.isLoading = false;
                                }
                            });
                    } else this.isLoading = false;
                }
                if (params['mode'] == 'difficulty') {
                    this.trainingView = true;
                    this.mode = 'difficulty';
                    if (!this.questions.length || !this.answers.length) {
                        this.questions = [];
                        this.answers = [];
                        this.http
                            .post(
                                environment.apiUrl +
                                    'getPracticeQuizzByDifficulty',
                                {
                                    difficulty: params['id']
                                }
                            )
                            .subscribe((res: any) => {
                                if (res.message != 'OK' || !res.questions) {
                                    console.error(res.message);
                                    this.router.navigate(['/practice']);
                                } else {
                                    this.questions = res.questions;
                                    localStorage.setItem(
                                        `questions-${params['id']}`,
                                        JSON.stringify(res.questions)
                                    );
                                    this.isLoading = false;
                                }
                            });
                    } else this.isLoading = false;
                }
            }
        });
    }

    selectedAnswer(event: any) {
        this.selectedAnswerIndex = event;
    }

    validatedAnswer(event: any) {
        this.answers.push(this.selectedAnswerIndex);
        localStorage.setItem(
            `answers-${this.id}`,
            JSON.stringify(this.answers)
        );
        if (
            this.questions[this.currentQuestionIndex].answers[
                this.selectedAnswerIndex
            ].correct
        )
            this.score++;
        if (this.userObj) {
            this.http
                .post(environment.apiUrl + 'updateQuestionStats', {
                    user_id: this.userObj._id,
                    question_id: this.questions[this.currentQuestionIndex]._id,
                    answer_status:
                        this.questions[this.currentQuestionIndex].answers[event]
                            .correct
                })
                .subscribe((res: any) => {});
        }
    }

    nextQuestionPressed(event: any) {
        this.selectedAnswerIndex = -1;
        if (this.status == 'ended') {
            this.router.navigate(['practice']);
            return;
        }
        if (this.currentQuestionIndex + 1 >= this.questions.length) {
            localStorage.removeItem(`questions-${this.mode}`);
            localStorage.removeItem(`answers-${this.mode}`);
            this.status = 'ended';
        } else this.currentQuestionIndex++;
    }
}
