import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import {
    NgcCookieConsentService,
    NgcStatusChangeEvent
} from 'ngx-cookieconsent';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'MasterQuizz';
    waiting: boolean = window.location.href.includes('masterquizz.fr');
    countDownDate: number = new Date('Sep 05, 2023 14:00:00').getTime();
    waitingMessage: string = '';

    //keep refs to subscriptions to be able to unsubscribe later
    private statusChangeSubscription!: Subscription;

    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    auth: any;

    showMenu: boolean = false;
    menuLinks: any = [];
    retries: number = 0;

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private cookieService: NgcCookieConsentService
    ) {
        if (this.waiting) {
            let x = setInterval(() => {
                let now = new Date().getTime();
                let distance = this.countDownDate - now;
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                let minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                this.waitingMessage =
                    days +
                    ':' +
                    (hours < 10 ? '0' : '') +
                    hours +
                    ':' +
                    (minutes < 10 ? '0' : '') +
                    minutes +
                    ':' +
                    (seconds < 10 ? '0' : '') +
                    seconds;
                if (distance < 0) {
                    clearInterval(x);
                    this.waitingMessage = ':)';
                    this.waiting = false;
                }
            }, 1000);
        }
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
        this.statusChangeSubscription =
            this.cookieService.statusChange$.subscribe(
                (event: NgcStatusChangeEvent) => {
                    // you can use this.cookieService.getConfig() to do stuff...
                }
            );
        this.getMenuLinks();
    }

    getMenuLinks() {
        this.menuLinks = [];
        if (window.location.href.includes('localhost'))
            this.menuLinks.push({
                text: 'Entraînement',
                path: '/practice'
            });
        this.menuLinks.push({
            text: 'Multijoueur',
            path: '/multiplayer'
        });
        this.menuLinks.push({
            text: 'Classements',
            path: '/leaderboard'
        });
        this.menuLinks.push({
            text: 'À propos',
            path: '/about'
        });
        if (this.userObj && this.userObj.admin)
            this.menuLinks.push({
                text: 'Questions',
                path: '/questions/manage'
            });
    }

    navigateToLogin() {
        let redirectUrl = this.router.url;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate([`/login`], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }

    navigateToRegister() {
        let redirectUrl = this.router.url;
        if (redirectUrl.includes('register') || redirectUrl.includes('login'))
            redirectUrl = '/';
        this.router.navigate(['register'], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        // unsubscribe to cookieconsent observables to prevent memory leaks
        this.statusChangeSubscription.unsubscribe();
    }
}
