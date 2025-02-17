import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
    NgcCookieConsentService,
    NgcStatusChangeEvent
} from 'ngx-cookieconsent';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [CommonModule, FontAwesomeModule, RouterModule]
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'MasterQuizz';

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
        // redirect .fly.dev domain to .fr
        if (window.location.href.includes('masterquizz.fly.dev')) {
            const newUrl = window.location.href.replace('.fly.dev', '.fr');
            window.location.replace(newUrl);
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
                    // you can use this.cookieService.getConfig() to do stuff…
                }
            );
        this.getMenuLinks();
    }

    getMenuLinks() {
        this.menuLinks = [];
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

    navigateToProfile(username: string) {
        this.showMenu = false;
        this.router.navigate([`/profile/${username}`]);
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        // unsubscribe to cookieconsent observables to prevent memory leaks
        this.statusChangeSubscription.unsubscribe();
    }
}
