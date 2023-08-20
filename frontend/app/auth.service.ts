import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, onAuthStateChanged } from 'firebase/auth';

import { environment } from '../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

    auth: any;
    googleProvider: any = new GoogleAuthProvider();

    user: any = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '')
        : null;
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    initAuth() {
        initializeApp(environment.firebaseConfig);
        this.auth = getAuth();
        this.auth.languageCode = 'fr';
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.user = user;
                this.userObj = this.getCurrentUserInfo();
            } else {
                this.user = null;
                this.userObj = null;
                localStorage.removeItem('userObj');
            }
        });
    }

    getAuth() {
        return this.auth;
    }

    getGoogleProvider() {
        return this.googleProvider;
    }

    onAuthStateChanged = onAuthStateChanged;

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
                })
            );
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('userObj');
        this.user = null;
        this.userObj = null;
        this.auth.signOut();
    }
}
