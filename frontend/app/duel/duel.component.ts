import { Component, type OnDestroy, type OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { WebSocketService } from '../websocket.service';
import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-duel',
    templateUrl: './duel.component.html',
    styleUrls: ['./duel.component.scss'],
})
export class DuelComponent implements OnDestroy {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    duelId: string = '';
    duelObj: any = null;
    startedDuelId: string = '';

    destroyed$ = new Subject();

    isRequestLoading: boolean = true;

    status: string = '';
    currentQuestion: any = null;
    currentQuestionIndex: number = 0;
    nextQuestion: any = null;
    selectedAnswerIndex: number = -1;
    nextQuestionReady: boolean = false;
    hideAnswers: boolean = false;

    eloChange: any;
    scores: any;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private ws: WebSocketService,
        private authService: AuthService
    ) {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate([`/login`], {
                queryParams: { redirectUrl: this.router.url },
            });
            return;
        } else {
            this.authService.getCurrentUserInfo().subscribe((userObj: any) => {
                this.userObj = userObj ? userObj : null; // Update userObj (in case user just logged in)
                this.authService.onAuthStateChanged(
                    this.authService.getAuth(),
                    async (user) => {
                        if (!user) {
                            this.router.navigate([`/login`], {
                                queryParams: { redirectUrl: this.router.url },
                            });
                            return;
                        }
                    }
                );
                this.ar.params.subscribe((params) => {
                    if (params['id']) {
                        this.duelId = params['id'];
                        this.status =
                            "Match trouvé ! En attente de l'adversaire...";
                    }
                    if (!this.duelId) {
                        this.http
                            .post(
                                environment.apiUrl + 'getCurrentDuelFromUser',
                                {
                                    user: this.userObj._id,
                                }
                            )
                            .subscribe((response: any) => {
                                if (response.message != 'OK') {
                                    console.error(response.message);
                                } else {
                                    if (response.match) {
                                        this.startedDuelId = response.match._id;
                                        this.status = 'Match en cours...';
                                    }
                                    this.isRequestLoading = false;
                                    this.initDuel();
                                }
                            });
                    } else {
                        this.isRequestLoading = false;
                        this.initDuel();
                    }
                });
            });
        }
    }

    initDuel(): void {
        this.ws
            .connect()
            .pipe(takeUntil(this.destroyed$))
            .subscribe((message: any) => {
                if (message.type == 'duel') {
                    console.log(message.status);
                    if (message.status == 'waiting') {
                        this.status = "Recherche d'adversaire en cours...";
                    } else if (
                        message.status == 'ready' &&
                        (message.match.users[0]._id == this.userObj._id ||
                            message.match.users[1]._id == this.userObj._id)
                    ) {
                        this.router.navigate(['duel', message.match._id]);
                    } else if (message.status == 'cancelled') {
                        this.status = '';
                    } else if (
                        message.status == 'started' &&
                        (message.match.users[0]._id == this.userObj._id ||
                            message.match.users[1]._id == this.userObj._id)
                    ) {
                        this.status = '';
                        this.duelObj = message.match;
                        this.currentQuestion = message.question;
                        this.currentQuestionIndex =
                            message.match.currentQuestion;
                    } else if (
                        message.status == 'ended' &&
                        (message.match.users[0]._id == this.userObj._id ||
                            message.match.users[1]._id == this.userObj._id)
                    ) {
                        this.status = 'ended';
                        this.duelObj = message.match;
                        this.currentQuestion =
                            message.match.questions[
                                message.match.questions.length - 1
                            ];
                        this.currentQuestionIndex =
                            message.match.currentQuestion;
                        this.eloChange = message.eloChanges[this.userObj._id];
                        this.scores = message.scores;
                    } else if (
                        message.status == 'waitingforanswer' &&
                        (message.match.users[0]._id == this.userObj._id ||
                            message.match.users[1]._id == this.userObj._id)
                    ) {
                        if (
                            message.match.currentQuestion ==
                            this.currentQuestionIndex
                        ) {
                            this.nextQuestionReady = false;
                            this.hideAnswers = true;
                        }
                    } else if (
                        message.status == 'answered' &&
                        (message.match.users[0]._id == this.userObj._id ||
                            message.match.users[1]._id == this.userObj._id)
                    ) {
                        this.nextQuestionReady = true;
                        this.hideAnswers = false;
                        this.nextQuestion = message.question;
                    } else if (message.status == 'not found') {
                        this.router.navigate(['multiplayer']);
                    }
                }
            });
        if (this.duelId) this.startMatch();
    }

    ngOnDestroy() {
        this.destroyed$.next(0);
        this.ws.closeConnection();
    }

    findMatch() {
        this.ws.send({
            type: 'duel',
            action: 'find',
            user: this.userObj._id,
        });
    }

    joinMatch() {
        this.router.navigate(['duel', this.startedDuelId]);
    }

    cancelSearch() {
        this.ws.send({
            type: 'duel',
            action: 'cancel',
            user: this.userObj._id,
        });
    }

    startMatch() {
        this.ws.send({
            type: 'duel',
            action: 'start',
            user: this.userObj._id,
            match: this.duelId,
        });
    }

    selectedAnswer(event: any) {
        this.selectedAnswerIndex = event;
    }

    validatedAnswer(event: any) {
        this.ws.send({
            type: 'duel',
            action: 'answer',
            user: this.userObj._id,
            match: this.duelId,
            answer: this.selectedAnswerIndex,
        });
    }

    nextQuestionPressed(event: any) {
        this.selectedAnswerIndex = -1;
        this.currentQuestionIndex++;
        this.currentQuestion = this.nextQuestion;
        this.nextQuestion = null;
        this.nextQuestionReady = false;
        this.hideAnswers = true;
        if (this.status == 'ended') {
            this.router.navigate(['multiplayer']);
        }
    }
}
