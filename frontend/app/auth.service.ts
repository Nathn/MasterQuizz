import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import {
    Auth,
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
} from 'firebase/auth';

import { environment } from '../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

    app: any;
    auth: any;
    googleProvider: any = new GoogleAuthProvider();

    user: any = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '')
        : null;
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    isUserAuthenticated: boolean = this.userObj && this.user ? true : false;

    initAuth() {
        this.app = initializeApp(environment.firebaseConfig);
        this.auth = getAuth();
        this.auth.languageCode = 'fr';
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.isUserAuthenticated = true;
                this.user = user;
                this.userObj = this.getCurrentUserInfo();
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                this.isUserAuthenticated = false;
                this.user = null;
                this.userObj = null;
                localStorage.removeItem('user');
                localStorage.removeItem('userObj');
            }
        });
    }

    getAuth(): Auth {
        return this.auth;
    }

    getGoogleProvider() {
        return this.googleProvider;
    }

    getApp() {
        return this.app;
    }

    onAuthStateChanged = onAuthStateChanged;

    isAuthenticated() {
        return this.isUserAuthenticated;
    }

    getCurrentUserInfo(): Observable<any> {
        return this.http
            .post(environment.apiUrl + 'getUserFromEmail', {
                email: this.user.email,
            })
            .pipe(
                map((response: any) => {
                    if (response.message != 'OK') {
                        console.error(response.message);
                        localStorage.removeItem('userObj');
                        return null;
                    } else {
                        localStorage.setItem(
                            'userObj',
                            JSON.stringify(response.user)
                        );
                        return response.user;
                    }
                }),
                catchError((error: any) => {
                    console.error(error);
                    localStorage.removeItem('userObj');
                    return throwError(error);
                })
            );
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('userObj');
        this.isUserAuthenticated = false;
        this.user = null;
        this.userObj = null;
        this.auth.signOut();
    }
}
