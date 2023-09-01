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

    isLoading: boolean = true;
    availableThemes: any = [];
    trainingView: boolean = false;
    questions: any = [];

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
                        this.isLoading = false;
                    });
            }
            if (params['mode'] && params['id']) {
                if (params['mode'] == 'theme') {
                    this.trainingView = true;
                    this.isLoading = true;
                    this.http
                        .post(environment.apiUrl + 'getQuestionsByTheme', {
                            theme: params['id']
                        })
                        .subscribe((res: any) => {
                            if (res.message != 'OK' || !res.questions) {
                                console.error(res.message);
                                this.router.navigate(['/practice']);
                            } else {
                                this.questions = res.questions;
                                this.isLoading = false;
                            }
                        });
                }
            }
        });
    }
}
