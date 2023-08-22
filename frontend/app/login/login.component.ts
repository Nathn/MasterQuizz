import { Component, NgZone, type OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AES } from 'crypto-js';

import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
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

    username: string = '';
    email: string = '';
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
                this.email = AES.decrypt(
                    response.email,
                    environment.encryptionKey
                ).toString(CryptoJS.enc.Utf8);
                signInWithEmailAndPassword(
                    this.authService.getAuth(),
                    this.email,
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
}
