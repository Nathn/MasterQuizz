import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-practice',
    templateUrl: './practice.component.html',
    styleUrls: ['./practice.component.scss'],
})
export class PracticeComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    isLoading: boolean = true;
    availableThemes: any = [];

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
            .post(environment.apiUrl + 'getAvailableThemes', {})
            .subscribe((res: any) => {
                if (res.themes) this.availableThemes = res.themes;
                this.isLoading = false;
            });
    }
}
