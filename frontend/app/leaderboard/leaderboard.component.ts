import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    rankedUsersByElo: any = [];
    rankedUsersByNbGames: any = [];
    rankedUsersByNbWins: any = [];

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
                if (res.users) this.rankedUsersByElo = res.users.slice(0, 50);
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbGames', {})
            .subscribe((res: any) => {
                if (res.users)
                    this.rankedUsersByNbGames = res.users.slice(0, 50);
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbWins', {})
            .subscribe((res: any) => {
                if (res.users)
                    this.rankedUsersByNbWins = res.users.slice(0, 50);
            });
    }
}
