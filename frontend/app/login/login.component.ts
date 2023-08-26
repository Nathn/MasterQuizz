import { Component, NgZone, type OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AES } from 'crypto-js';
import * as CryptoJS from 'crypto-js';

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    screen: string = 'login';

    email: string = '';
    username: string = '';
    password: string = '';

    isLoading: boolean = false;
    redirectUrl: string = '';

    constructor(
        private ar: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private zone: NgZone,
        private authService: AuthService
    ) {
        this.redirectUrl = this.ar.snapshot.queryParams['redirectUrl'] || '';
        if (this.userObj) this.router.navigate([this.redirectUrl]);
        this.authService.onAuthStateChanged(
            this.authService.getAuth(),
            async (user) => {
                if (this.authService.isAuthenticated()) {
                    if (
                        !this.redirectUrl.includes('login') &&
                        !this.redirectUrl.includes('register')
                    ) {
                        this.router.navigate([this.redirectUrl]);
                    } else {
                        this.router.navigate(['/']);
                    }
                }
            }
        );
        if (this.ar.snapshot.params['action'] == 'forgotPassword') {
            this.screen = 'reset';
        }
    }

    ngOnInit(): void {
        // gives focus to the first input
        document.getElementById('username')?.focus();
    }

    login() {
        this.isLoading = true;
        this.http
            .post(environment.apiUrl + 'getEmailFromUsername', {
                username: this.username,
            })
            .subscribe((response: any) => {
                if (response.message != 'OK') {
                    alert(response.message);
                    this.isLoading = false;
                    return;
                }
                signInWithEmailAndPassword(
                    this.authService.getAuth(),
                    AES.decrypt(
                        response.email,
                        environment.encryptionKey
                    ).toString(CryptoJS.enc.Utf8),
                    this.password
                )
                    .then((userCredential) => {
                        // Signed in
                        localStorage.setItem('longModuleShown', '1'); // home screen closeable module
                        this.router.navigate([this.redirectUrl]);
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log('error', errorCode, errorMessage);
                        if (errorCode == 'auth/wrong-password') {
                            alert('Mot de passe incorrect.');
                        }
                        if (errorCode == 'auth/user-not-found') {
                            alert("Nom d'utilisateur introuvable.");
                        }
                        this.isLoading = false;
                    });
            });
    }

    loginWithGoogle() {
        this.isLoading = true;
        signInWithPopup(
            this.authService.getAuth(),
            this.authService.getGoogleProvider()
        )
            .then((result) => {
                this.zone.run(() => this.registerWithGoogle(result.user));
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('error', errorCode, errorMessage);
                this.isLoading = false;
            });
    }

    registerWithGoogle(user: any) {
        // Already signed in
        // add user to database in case it doesn't exist
        this.http
            .post(environment.apiUrl + 'register', {
                username: user.email.split('@')[0],
                email: user.email,
                avatar: user.photoURL,
            })
            .subscribe((response: any) => {
                if (response.message != 'OK') {
                    console.warn(response.message);
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                } else {
                    localStorage.setItem('longModuleShown', '1'); // home screen closeable module
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                }
            });
    }

    navigateToReset() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/login/forgotPassword'], {
            queryParams: { redirectUrl: redirectUrl },
        });
    }

    navigateToLogin() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/login'], {
            queryParams: { redirectUrl: redirectUrl },
        });
    }

    navigateToRegister() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/register'], {
            queryParams: { redirectUrl: redirectUrl },
        });
    }

    sendResetEmail() {
        console.log(this.email);
        this.isLoading = true;
        sendPasswordResetEmail(this.authService.getAuth(), this.email)
            .then(() => {
                alert(
                    "Un email de réinitialisation de mot de passe a été envoyé à l'addresse" +
                        this.email +
                        '.'
                );
                let redirectUrl = this.redirectUrl;
                if (
                    redirectUrl.includes('login') ||
                    redirectUrl.includes('register')
                )
                    redirectUrl = '/';
                this.isLoading = false;
                this.router.navigate(['/login'], {
                    queryParams: { redirectUrl: redirectUrl },
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('error', errorCode, errorMessage);
                if (errorCode == 'auth/user-not-found') {
                    alert("Aucun compte n'est associé à cet email.");
                }
                if (errorCode == 'auth/invalid-email') {
                    alert('Email invalide.');
                }
                this.isLoading = false;
            });
    }
}
