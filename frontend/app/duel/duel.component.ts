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
    styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnDestroy {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    duelId: string = '';
    duelObj: any = null;
    startedDuelId: string = '';
    spectator: boolean = false;

    destroyed$ = new Subject();

    isRequestLoading: boolean = true;

    status: string = '';
    currentQuestion: any = null;
    currentQuestionIndex: number = 0;
    nextQuestion: any = null;
    selectedAnswerIndex: number = -1;
    nextQuestionReady: boolean = false;
    opponent: object = {};
    hideAnswers: boolean = false;
    answerValidated: boolean = false;

    // spect mode
    opponent1: any;
    opponent2: any;

    eloChange: any;
    scores: any;
    answers: any;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private ws: WebSocketService,
        private authService: AuthService
    ) {
        if (!this.authService.isAuthenticated()) {
            this.router.navigate([`/login`], {
                queryParams: { redirectUrl: this.router.url, redirected: true }
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
                                queryParams: {
                                    redirectUrl: this.router.url,
                                    redirected: true
                                }
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
                                    user: this.userObj._id
                                }
                            )
                            .subscribe((res: any) => {
                                if (res.message != 'OK') {
                                    console.error(res.message);
                                } else {
                                    if (res.match) {
                                        this.startedDuelId = res.match._id;
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
                        message.match._id == this.duelId
                    ) {
                        this.status = '';
                        this.duelObj = message.match;
                        this.currentQuestion = message.question;
                        this.currentQuestionIndex =
                            message.match.currentQuestion;
                        if (
                            message.match.users[0]._id != this.userObj._id &&
                            message.match.users[1]._id != this.userObj._id
                        ) {
                            this.answerValidated = true;
                            this.spectator = true;
                        }
                    } else if (
                        message.status == 'ended' &&
                        message.match._id == this.duelId
                    ) {
                        if (this.duelObj) {
                            // If match just ended
                            window.location.reload(); // Reload page to reload ELO score
                        }
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
                        this.answers = message.answers;
                    } else if (
                        message.status == 'waitingforanswer' &&
                        message.match._id == this.duelId
                    ) {
                        if (
                            message.match.currentQuestion ==
                            this.currentQuestionIndex
                        ) {
                            if (message.user == this.userObj._id) {
                                this.answerValidated = true;
                            }
                            this.nextQuestionReady = false;
                            this.hideAnswers = true;
                        }
                    } else if (
                        message.status == 'answered' &&
                        message.match._id == this.duelId
                    ) {
                        if (message.match.users[0]._id == this.userObj._id)
                            this.opponent = {
                                answer: message.match.answers[
                                    this.currentQuestionIndex
                                ][message.match.users[1]._id],
                                avatarUrl: message.match.users[1].avatarUrl,
                                displayName:
                                    message.match.users[1].displayName ||
                                    message.match.users[1].username
                            };
                        else if (message.match.users[1]._id == this.userObj._id)
                            this.opponent = {
                                answer: message.match.answers[
                                    this.currentQuestionIndex
                                ][message.match.users[0]._id],
                                avatarUrl: message.match.users[0].avatarUrl,
                                displayName:
                                    message.match.users[0].displayName ||
                                    message.match.users[0].username
                            };
                        else {
                            this.opponent1 = {
                                answer: message.match.answers[
                                    this.currentQuestionIndex
                                ][message.match.users[0]._id],
                                avatarUrl: message.match.users[0].avatarUrl,
                                displayName:
                                    message.match.users[0].displayName ||
                                    message.match.users[0].username
                            };
                            this.opponent2 = {
                                answer: message.match.answers[
                                    this.currentQuestionIndex
                                ][message.match.users[1]._id],
                                avatarUrl: message.match.users[1].avatarUrl,
                                displayName:
                                    message.match.users[1].displayName ||
                                    message.match.users[1].username
                            };
                        }
                        this.nextQuestionReady = true;
                        this.hideAnswers = false;
                        this.nextQuestion = message.question;
                        if (
                            message.match.users[0]._id != this.userObj._id &&
                            message.match.users[1]._id != this.userObj._id
                        ) {
                            this.answerValidated = true;
                        }
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
            user: this.userObj._id
        });
    }

    joinMatch() {
        this.router.navigate(['duel', this.startedDuelId]);
    }

    cancelSearch() {
        this.ws.send({
            type: 'duel',
            action: 'cancel',
            user: this.userObj._id
        });
    }

    startMatch() {
        this.ws.send({
            type: 'duel',
            action: 'start',
            user: this.userObj._id,
            match: this.duelId
        });
    }

    selectedAnswer(event: any) {
        this.selectedAnswerIndex = event;
    }

    validatedAnswer(event: any) {
        this.answerValidated = true;
        this.ws.send({
            type: 'duel',
            action: 'answer',
            user: this.userObj._id,
            match: this.duelId,
            answer: this.selectedAnswerIndex
        });
    }

    nextQuestionPressed(event: any) {
        this.selectedAnswerIndex = -1;
        this.currentQuestionIndex++;
        this.currentQuestion = this.nextQuestion;
        this.nextQuestion = null;
        this.nextQuestionReady = false;
        this.hideAnswers = true;
        this.opponent = {};
        if (!this.spectator) this.answerValidated = false;
        if (this.status == 'ended') {
            this.router.navigate(['multiplayer']);
        }
    }
}
