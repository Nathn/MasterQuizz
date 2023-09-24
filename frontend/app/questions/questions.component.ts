import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-questions',
    templateUrl: './questions.component.html',
    styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    action: string = '';

    successMessage: string = '';

    isAuthLoading: boolean = true;
    isRequestLoading: boolean = false;

    themes: {
        name: string;
        code: string;
    }[] = [];
    validActions: string[] = ['add', 'edit', 'manage'];
    questionsList: {
        _id: string;
        question: string;
        created: Date;
        nbAnswers: number;
        answers: {
            answer: string;
            correct: boolean;
        }[];
        goodAnswer: number;
        theme: {
            name: string;
            code: string;
        };
        difficulty: number;
        user: {
            username: string;
        };
        userUpdated: {
            username: string;
        };
    }[] = [];

    questionEditedId: string = '';
    search: string = '';

    question: string = '';
    nbAnswers: number = 4;
    answers: string[] = [];
    goodAnswer: number = 0;
    themeSelected: string = '';
    difficulty: number = -1;
    editSaved: boolean = false;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.ar.params.subscribe((params) => {
            this.action = params['action'];
            if (!this.authService.isAuthenticated()) {
                this.router.navigate([`/login`], {
                    queryParams: {
                        redirectUrl: this.router.url,
                        redirected: true
                    }
                });
                return;
            } else {
                this.authService
                    .getCurrentUserInfo()
                    .subscribe((userObj: any) => {
                        this.userObj = userObj ? userObj : null; // Update userObj (in case user just logged in)
                        if (!this.userObj) {
                            this.router.navigate([`/login`], {
                                queryParams: {
                                    redirectUrl: this.router.url,
                                    redirected: true
                                }
                            });
                            return;
                        }
                        if (this.action == 'add')
                            this.difficulty =
                                this.difficulty > 0 ? this.difficulty : 3;
                        if (this.action == 'manage') this.difficulty = -1;
                        if (!this.userObj.admin && this.action != 'add') {
                            this.router.navigate(['']);
                            return;
                        }
                        this.authService.onAuthStateChanged(
                            this.authService.getAuth(),
                            async (user) => {
                                if (user) {
                                    if (
                                        !this.userObj.admin &&
                                        this.action != 'add'
                                    ) {
                                        this.router.navigate(['']);
                                        return;
                                    }
                                } else {
                                    this.router.navigate([`/login`], {
                                        queryParams: {
                                            redirectUrl: this.router.url,
                                            redirected: true
                                        }
                                    });
                                    return;
                                }
                            }
                        );
                    });
            }
            this.http
                .post(environment.apiUrl + 'getAllThemes', {})
                .subscribe((res: any) => {
                    if (res.message != 'OK') {
                        console.error(res.message);
                    } else {
                        this.themes = res.themes;
                        this.successMessage = '';
                        if (!this.validActions.includes(this.action))
                            this.router.navigate(['/questions/manage']);
                        if (this.action == 'manage') this.getQuestions();
                        if (this.action == 'edit') {
                            this.questionEditedId = params['id'];
                            this.getQuestionInfo(this.questionEditedId);
                        }
                        this.isAuthLoading = false;
                    }
                });
        });
    }

    async getQuestions() {
        if (this.questionsList.length == 0) this.isRequestLoading = true;
        this.http
            .post(environment.apiUrl + 'getAllQuestions', {
                user: this.userObj._id
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    console.error(res.message);
                } else {
                    this.questionsList = res.questions;
                    this.isRequestLoading = false;
                }
            });
    }

    async getQuestionInfo(id: string) {
        this.isRequestLoading = true;
        this.http
            .post(environment.apiUrl + 'getQuestionFromId', {
                questionId: id
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    console.error(res.message);
                } else {
                    this.question = res.question.question;
                    this.nbAnswers = res.question.answers.length;
                    this.answers = [];
                    for (let answer of res.question.answers) {
                        this.answers.push(answer.answer);
                    }
                    let goodAnswer: number = 0;
                    for (let i = 0; i < res.question.answers.length; i++) {
                        if (res.question.answers[i].correct) {
                            goodAnswer = i;
                            break;
                        }
                    }
                    this.goodAnswer = goodAnswer;
                    this.themeSelected = res.question.theme.code;
                    this.difficulty = res.question.difficulty;
                    this.isRequestLoading = false;
                }
            });
    }

    getQuestionsFiltered() {
        let filteredQuestions: any[] = [];
        outer: for (let question of this.questionsList) {
            if (
                this.themeSelected != '' &&
                this.themeSelected != question.theme.code
            )
                continue;
            if (this.difficulty != -1 && this.difficulty != question.difficulty)
                continue;
            if (
                question.question
                    .toLowerCase()
                    .includes(this.search.toLowerCase())
            ) {
                filteredQuestions.push(question);
                continue;
            }
            if (
                question.theme.name
                    .toLowerCase()
                    .includes(this.search.toLowerCase())
            ) {
                filteredQuestions.push(question);
                continue;
            }
            if (
                question.user.username
                    .toLowerCase()
                    .includes(this.search.toLowerCase())
            ) {
                filteredQuestions.push(question);
                continue;
            }
            for (let answer of question.answers) {
                if (
                    answer.answer
                        .toLowerCase()
                        .includes(this.search.toLowerCase())
                ) {
                    filteredQuestions.push(question);
                    continue outer;
                }
            }
        }
        return filteredQuestions;
    }

    backToList() {
        if (this.question != '' && !this.editSaved) {
            if (
                confirm(
                    'Êtes-vous sûr de vouloir quitter cette page ? Les modifications non enregistrées seront perdues.'
                )
            ) {
                this.router.navigate(['/questions/manage']);
            }
        } else this.router.navigate(['/questions/manage']);
    }

    actionQuestion() {
        if (this.action == 'edit') this.editQuestion();
        else if (this.action == 'add') this.addQuestion();
    }

    addQuestion() {
        this.isRequestLoading = true;
        let formattedAnswers: any[] = [];
        for (let i = 0; i < this.nbAnswers; i++) {
            formattedAnswers.push({
                answer: this.answers[i],
                correct: i == this.goodAnswer
            });
        }
        this.http
            .post(environment.apiUrl + 'createQuestion', {
                question: this.question,
                nbAnswers: this.nbAnswers,
                answers: formattedAnswers,
                goodAnswer: this.goodAnswer,
                theme: this.themeSelected,
                difficulty: this.difficulty,
                user_id: this.userObj._id
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    console.error(res.message);
                } else {
                    if (this.userObj.admin) {
                        this.successMessage = 'La question a bien été ajoutée.';
                    } else {
                        this.successMessage =
                            'La question a bien été soumise aux administrateurs.';
                    }
                    // reset form
                    this.question = '';
                    this.nbAnswers = 4;
                    this.answers = [];
                    this.goodAnswer = 0;
                    this.themeSelected = '';
                    this.difficulty = 3;
                }
                this.isRequestLoading = false;
            });
    }

    editQuestion() {
        this.isRequestLoading = true;
        let formattedAnswers: any[] = [];
        for (let i = 0; i < this.nbAnswers; i++) {
            formattedAnswers.push({
                answer: this.answers[i],
                correct: i == this.goodAnswer
            });
        }
        this.http
            .post(environment.apiUrl + 'updateQuestion', {
                questionId: this.questionEditedId,
                question: this.question,
                nbAnswers: this.nbAnswers,
                answers: formattedAnswers,
                goodAnswer: this.goodAnswer,
                theme: this.themeSelected,
                difficulty: this.difficulty,
                user_id: this.userObj._id
            })
            .subscribe((res: any) => {
                this.editSaved = true;
                this.isRequestLoading = false;
                if (res.message != 'OK') {
                    console.error(res.message);
                } else {
                    this.successMessage = 'La question a bien été modifiée.';
                }
            });
    }

    deleteQuestion(question: any) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
            this.http
                .post(environment.apiUrl + 'deleteQuestion', {
                    questionId: question._id
                })
                .subscribe((res: any) => {
                    if (res.message != 'OK') {
                        console.error(res.message);
                    } else {
                        this.successMessage =
                            'La question a bien été supprimée.';
                        this.questionsList.splice(
                            this.questionsList.indexOf(question),
                            1
                        );
                    }
                });
        }
    }

    switchQuestionOnlineStatus(question: any) {
        this.http
            .post(environment.apiUrl + 'switchQuestionOnlineStatus', {
                question_id: question._id,
                user_id: this.userObj._id
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    console.error(res.message);
                } else {
                    question.online = !question.online;
                }
            });
    }
}
