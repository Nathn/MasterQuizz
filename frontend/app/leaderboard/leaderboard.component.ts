import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    rankedUsersByElo: any = [];
    rankedUsersByNbGames: any = [];
    rankedUsersByNbWins: any = [];
    rankedUsersByNbGoodAnswers: any = [];

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private authService: AuthService
    ) {
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
        this.http
            .post(environment.apiUrl + 'getTopUsersByElo', {})
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByElo = res.users.slice(0, 15);
                    this.addCurrentMatches(this.rankedUsersByElo);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbGames', {})
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbGames = res.users.slice(0, 15);
                    this.addCurrentMatches(this.rankedUsersByNbGames);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbWins', {})
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbWins = res.users.slice(0, 15);
                    this.addCurrentMatches(this.rankedUsersByNbWins);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbGoodAnswers', {})
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbGoodAnswers = res.users.slice(0, 15);
                    this.addCurrentMatches(this.rankedUsersByNbGoodAnswers);
                }
            });
    }

    addCurrentMatches(users: any[]) {
        // for each user, call getCurrentDuelFromUser and add it to the user object
        users.forEach((user: any) => {
            this.http
                .post(environment.apiUrl + 'getCurrentDuelFromUser', {
                    user: user._id
                })
                .subscribe((res: any) => {
                    if (res.match) {
                        user.currentDuelId = res.match._id;
                        if (
                            this.userObj &&
                            res.match.users.includes(this.userObj._id)
                        ) {
                            user.isCurrentDuelUser = true;
                        } else {
                            user.isCurrentDuelUser = false;
                        }
                    }
                });
        });
    }
}
