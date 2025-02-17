import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { HomeModuleComponent } from '../home-module/home-module.component';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
    imports: [CommonModule, HomeModuleComponent]
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
            .post(environment.apiUrl + 'getTopUsersByElo', {
                user_id: this.userObj ? this.userObj._id : null
            })
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByElo = res.users.slice(0, 15);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbGames', {
                user_id: this.userObj ? this.userObj._id : null
            })
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbGames = res.users.slice(0, 15);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbWins', {
                user_id: this.userObj ? this.userObj._id : null
            })
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbWins = res.users.slice(0, 15);
                }
            });
        this.http
            .post(environment.apiUrl + 'getTopUsersByNbGoodAnswers', {
                user_id: this.userObj ? this.userObj._id : null
            })
            .subscribe((res: any) => {
                if (res.users) {
                    this.rankedUsersByNbGoodAnswers = res.users.slice(0, 15);
                }
            });
    }
}
