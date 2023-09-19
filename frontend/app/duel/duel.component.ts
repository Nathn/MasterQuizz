import { Component, type OnDestroy, type OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import * as dayjs from 'dayjs';
import 'dayjs/locale/fr'; // Import the French locale
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin

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
    opponentId: string = '';
    startedDuelId: string = '';
    spectator: boolean = false;
    dayjs: any = dayjs;
    refreshInterval: any = null;

    destroyed$ = new Subject();

    isRequestLoading: boolean = true;

    status: string = '';
    currentQuestion: any = null;
    currentQuestionIndex: number = 0;
    tempCurrentQuestionIndex: number = 0;
    nextQuestion: any = null;
    selectedAnswerIndex: number = -1;
    nextQuestionReady: boolean = false;
    opponent: object = {};
    hideAnswers: boolean = false;
    answerValidated: boolean = false;
    ended: boolean = false;

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
        dayjs.locale('fr');
        dayjs.extend(relativeTime);
        this.ar.params.subscribe((params) => {
            if (params['id']) {
                this.duelId = params['id'];
                this.status = "Match trouvé ! En attente de l'adversaire...";
            }
            if (!this.duelId) {
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
                            this.userObj = userObj ? userObj : null;
                            this.http
                                .post(
                                    environment.apiUrl +
                                        'getCurrentDuelFromUser',
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
                        });
                }
            } else {
                this.isRequestLoading = false;
                this.initDuel();
            }
        });
        if (this.authService.isAuthenticated()) {
            this.authService.getCurrentUserInfo().subscribe((userObj: any) => {
                this.userObj = userObj ? userObj : null; // Update userObj (in case user just logged in)
                this.authService.onAuthStateChanged(
                    this.authService.getAuth(),
                    async (user) => {
                        if (!user && !this.duelId) {
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
        } else if (!this.duelId)
            this.router.navigate([`/login`], {
                queryParams: {
                    redirectUrl: this.router.url,
                    redirected: true
                }
            });
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
                            !this.userObj ||
                            (message.match.users[0]._id != this.userObj._id &&
                                message.match.users[1]._id != this.userObj._id)
                        ) {
                            this.answerValidated = true;
                            this.spectator = true;
                        } else if (
                            this.userObj &&
                            message.match.users[0]._id == this.userObj._id
                        ) {
                            this.opponentId = message.match.users[1]._id;
                        } else if (
                            this.userObj &&
                            message.match.users[1]._id == this.userObj._id
                        ) {
                            this.opponentId = message.match.users[0]._id;
                        }
                    } else if (
                        message.status == 'ended' &&
                        message.match._id == this.duelId
                    ) {
                        if (this.duelObj == null) {
                            this.status = 'ended';
                            this.duelObj = message.match;
                            this.currentQuestion =
                                message.match.questions[
                                    message.match.questions.length - 1
                                ];
                            this.currentQuestionIndex =
                                message.match.currentQuestion;
                        } else {
                            this.answerValidated = true;
                            this.currentQuestionIndex =
                                message.match.currentQuestion;
                            if (
                                message.answers[this.currentQuestionIndex] &&
                                message.answers[this.currentQuestionIndex][
                                    message.match.users[0]._id
                                ] &&
                                message.answers[this.currentQuestionIndex][
                                    message.match.users[1]._id
                                ]
                            ) {
                                if (
                                    this.userObj &&
                                    message.match.users[0]._id ==
                                        this.userObj._id
                                )
                                    this.opponent = {
                                        answer: message.answers[
                                            this.currentQuestionIndex
                                        ][message.match.users[1]._id],
                                        avatarUrl:
                                            message.match.users[1].avatarUrl,
                                        displayName:
                                            message.match.users[1]
                                                .displayName ||
                                            message.match.users[1].username
                                    };
                                else if (
                                    this.userObj &&
                                    message.match.users[1]._id ==
                                        this.userObj._id
                                )
                                    this.opponent = {
                                        answer: message.answers[
                                            this.currentQuestionIndex
                                        ][message.match.users[0]._id],
                                        avatarUrl:
                                            message.match.users[0].avatarUrl,
                                        displayName:
                                            message.match.users[0]
                                                .displayName ||
                                            message.match.users[0].username
                                    };
                                else {
                                    this.opponent1 = {
                                        answer: message.answers[
                                            this.currentQuestionIndex
                                        ][message.match.users[0]._id],
                                        avatarUrl:
                                            message.match.users[0].avatarUrl,
                                        displayName:
                                            message.match.users[0]
                                                .displayName ||
                                            message.match.users[0].username
                                    };
                                    this.opponent2 = {
                                        answer: message.answers[
                                            this.currentQuestionIndex
                                        ][message.match.users[1]._id],
                                        avatarUrl:
                                            message.match.users[1].avatarUrl,
                                        displayName:
                                            message.match.users[1]
                                                .displayName ||
                                            message.match.users[1].username
                                    };
                                }
                            }
                            this.ended = true;
                            this.nextQuestionReady = true;
                            this.hideAnswers = false;
                            this.duelObj = message.match;
                        }
                        if (this.userObj)
                            this.eloChange =
                                message.eloChanges[this.userObj._id];
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
                        this.duelObj = message.match;
                        if (
                            this.userObj &&
                            message.match.users[0]._id == this.userObj._id
                        )
                            this.opponent = {
                                answer: message.match.answers[
                                    this.currentQuestionIndex
                                ][message.match.users[1]._id],
                                avatarUrl: message.match.users[1].avatarUrl,
                                displayName:
                                    message.match.users[1].displayName ||
                                    message.match.users[1].username
                            };
                        else if (
                            this.userObj &&
                            message.match.users[1]._id == this.userObj._id
                        )
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
                            this.tempCurrentQuestionIndex =
                                message.match.currentQuestion;
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
                            (message.match.users[0]._id != this.userObj._id &&
                                message.match.users[1]._id !=
                                    this.userObj._id) ||
                            !this.userObj
                        ) {
                            this.answerValidated = true;
                        }
                    } else if (message.status == 'not found') {
                        this.router.navigate(['multiplayer']);
                    }
                }
            });
        if (this.duelId) {
            this.startMatch();
            this.refreshInterval = setInterval(() => {
                if (!this.duelObj) this.startMatch();
            }, 1000);
        }
    }

    ngOnDestroy() {
        this.destroyed$.next(0);
        this.ws.closeConnection();
        if (this.refreshInterval) clearInterval(this.refreshInterval);
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
            user: this.userObj ? this.userObj._id : null,
            match: this.duelId
        });
    }

    forfeitMatch() {
        // confirm popup
        if (
            confirm(
                'Êtes-vous sûr de vouloir abandonner le match ? Il sera considéré comme perdu.'
            )
        ) {
            this.ws.send({
                type: 'duel',
                action: 'forfeit',
                user: this.userObj._id,
                match: this.duelId
            });
        }
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

    timeOut(event: any) {
        // This is triggered only when the opponent is not connected
        // We send an answer (-1) as the opponent's answer
        this.ws.send({
            type: 'duel',
            action: 'answer',
            user: this.opponentId,
            match: this.duelId,
            answer: -1
        });
    }

    nextQuestionPressed(event: any) {
        this.selectedAnswerIndex = -1;
        if (this.spectator) {
            this.currentQuestionIndex = this.tempCurrentQuestionIndex;
        } else {
            this.currentQuestionIndex++;
        }
        this.currentQuestion = this.nextQuestion || this.currentQuestion;
        this.nextQuestion = null;
        this.nextQuestionReady = false;
        this.hideAnswers = true;
        this.opponent = {};
        if (!this.spectator) this.answerValidated = false;
        if (this.spectator) {
            this.opponent1 = {};
            this.opponent2 = {};
        }
        if (this.status == 'ended') {
            if (this.userObj) this.router.navigate(['multiplayer']);
            else this.router.navigate(['']);
        }
        if (this.ended) {
            this.status = 'ended';
            return;
        }
    }
}
