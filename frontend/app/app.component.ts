import { Component, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
    faSpinner,
    faBars,
    faSignInAlt,
    faUserPlus,
    faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    title = 'MasterQuizz';

    auth: any;

    user: any = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '')
        : null;
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    isLoading: boolean = localStorage.getItem('user') ? false : true;
    showMenu: boolean = false;
    menuLinks: any = [];
    retries: number = 0;

    faSpinner = faSpinner;
    faBars = faBars;
    faSignInAlt = faSignInAlt;
    faUserPlus = faUserPlus;
    faSignOutAlt = faSignOutAlt;

    constructor(private router: Router, private http: HttpClient) {
        if (this.user) {
            this.getUserInfo();
        }
        initializeApp(environment.firebaseConfig);
        this.auth = getAuth();
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.user = user;
                localStorage.setItem('user', JSON.stringify(user));
                this.isLoading = true;
                this.getUserInfo();
            } else {
                this.user = null;
                this.userObj = null;
                localStorage.removeItem('user');
                localStorage.removeItem('userObj');
                this.getMenuLinks();
            }
            this.isLoading = false;
        });
    }

    ngOnInit() {
        this.getMenuLinks();
    }

    getUserInfo() {
        this.http
            .post(environment.apiUrl + 'getUserFromEmail', {
                email: this.user.email,
            })
            .subscribe((response: any) => {
                if (response.message != 'OK') {
                    this.userObj = null;
                    if (
                        response.message.startsWith(
                            'Utilisateur introuvable'
                        ) &&
                        this.retries < 10
                    ) {
                        this.retries++;
                        this.isLoading = true;
                        this.getUserInfo(); // try again
                    } else {
                        this.user = null;
                        this.userObj = null;
                        localStorage.removeItem('user');
                        localStorage.removeItem('userObj');
                        this.isLoading = false;
                    }
                } else {
                    this.userObj = response.user;
                    localStorage.setItem(
                        'userObj',
                        JSON.stringify(response.user)
                    );
                    this.getMenuLinks();
                    this.isLoading = false;
                }
            });
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
        this.router.navigate(['login']);
    }

    navigateToRegister() {
        this.router.navigate(['register']);
    }

    logout() {
        this.auth.signOut();
    }
}
