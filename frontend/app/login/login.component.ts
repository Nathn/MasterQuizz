import { Component, NgZone, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AES } from 'crypto-js';
import * as CryptoJS from 'crypto-js';

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [CommonModule, FormsModule, FontAwesomeModule]
})
export class LoginComponent implements OnInit {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    screen: string = 'login';

    email: string = '';
    username: string = '';
    password: string = '';

    error: string = '';
    warning: string = '';

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
        if (this.ar.snapshot.queryParams['emailSent']) {
            this.warning =
                "Un email de réinitialisation de mot de passe a été envoyé à l'addresse indiquée.";
        } else if (
            this.redirectUrl &&
            this.redirectUrl != '/' &&
            this.ar.snapshot.queryParams['redirected']
        )
            this.warning =
                "Vous tentez d'accéder à une page qui nécessite d'être connecté.";
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
                username: this.username
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    this.error = res.message;
                    this.isLoading = false;
                    return;
                }
                signInWithEmailAndPassword(
                    this.authService.getAuth(),
                    AES.decrypt(res.email, environment.encryptionKey).toString(
                        CryptoJS.enc.Utf8
                    ),
                    this.password
                )
                    .then((userCredential) => {
                        // Signed in
                        localStorage.setItem('longModule1Shown', '1'); // home screen closeable module
                        localStorage.setItem('longModule2Shown', '1'); // home screen closeable module
                        this.router.navigate([this.redirectUrl]);
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log('error', errorCode, errorMessage);
                        switch (errorCode) {
                            case 'auth/wrong-password':
                                this.error = 'Mot de passe incorrect.';
                                break;
                            case 'auth/user-not-found':
                                this.error = "Nom d'utilisateur introuvable.";
                                break;
                            case 'auth/invalid-login-credentials':
                                this.error =
                                    'Les identifiants renseignés sont invalides.';
                                break;
                            default:
                                this.error =
                                    'Une erreur inconnue est survenue. Veuillez réessayer.';
                                break;
                        }
                        this.isLoading = false;
                    });
            });
    }

    loginWithGoogle() {
        this.isLoading = true;
        this.error = '';
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
                avatar: user.photoURL
            })
            .subscribe((res: any) => {
                localStorage.setItem('longModule1Shown', '1'); // home screen closeable module
                localStorage.setItem('longModule2Shown', '1'); // home screen closeable module
                if (res.message != 'OK') {
                    console.warn(res.message);
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                } else {
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                }
            });
    }

    navigateToReset() {
        let redirectUrl = this.redirectUrl;
        this.error = '';
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/login/forgotPassword'], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }

    navigateToLogin() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/login'], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }

    navigateToRegister() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate(['/register'], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }

    passwordVisible = false;
    togglePasswordVisibility() {
        const passwordInput = document.getElementById(
            'password'
        ) as HTMLInputElement;
        this.passwordVisible = !this.passwordVisible;
        passwordInput.type = this.passwordVisible ? 'text' : 'password';
    }

    sendResetEmail() {
        this.isLoading = true;
        sendPasswordResetEmail(this.authService.getAuth(), this.email)
            .then(() => {
                let redirectUrl = this.redirectUrl;
                if (
                    redirectUrl.includes('login') ||
                    redirectUrl.includes('register')
                )
                    redirectUrl = '/';
                this.isLoading = false;
                this.router.navigate(['/login'], {
                    queryParams: {
                        redirectUrl: redirectUrl,
                        emailSent: true
                    }
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log('error', errorCode, errorMessage);
                if (errorCode == 'auth/user-not-found') {
                    this.error = "Aucun compte n'est associé à cet email.";
                }
                if (errorCode == 'auth/invalid-email') {
                    this.error = "L'email est invalide.";
                }
                this.isLoading = false;
            });
    }
}
