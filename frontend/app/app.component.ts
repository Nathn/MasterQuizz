import { Component, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'MasterQuizz';

    auth: any;

    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    isLoading: boolean = localStorage.getItem('user') ? false : true;
    showMenu: boolean = false;
    menuLinks: any = [];
    retries: number = 0;

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.authService.initAuth();
        this.authService.onAuthStateChanged(
            this.authService.getAuth(),
            async (user) => {
                if (user) {
                    this.authService
                        .getCurrentUserInfo()
                        .subscribe((userObj: any) => {
                            this.userObj = userObj ? userObj : null;
                            this.getMenuLinks();
                        });
                } else {
                    this.userObj = null;
                    this.getMenuLinks();
                }
            }
        );
    }

    ngOnInit() {
        this.getMenuLinks();
    }

    getMenuLinks() {
        this.menuLinks = [];
        this.menuLinks.push({
            text: 'Entraînement',
            path: '/practice',
        });
        this.menuLinks.push({
            text: 'Multijoueur',
            path: '/multiplayer',
        });
        this.menuLinks.push({
            text: 'Classements',
            path: '/leaderboard',
        });
        this.menuLinks.push({
            text: 'À propos',
            path: '/about',
        });
        if (this.userObj && this.userObj.admin)
            this.menuLinks.push({
                text: 'Questions',
                path: '/questions/manage',
            });
    }

    navigateToLogin() {
        this.router.navigate([`/login`], {
            queryParams: { redirectUrl: this.router.url },
        });
    }

    navigateToRegister() {
        this.router.navigate(['register'], {
            queryParams: { redirectUrl: this.router.url },
        });
    }

    logout() {
        this.authService.logout();
    }
}
