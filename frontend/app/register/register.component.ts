import { Component, type OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { AuthService } from '../auth.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;

    email: string = '';
    username: string = '';
    password: string = '';
    cgu: boolean = false;

    error: string = '';

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

    register() {
        this.isLoading = true;
        // check password length
        if (this.password.length < 6) {
            this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
            this.isLoading = false;
            return;
        }
        // check if all the info is valid through api
        this.http
            .post(environment.apiUrl + 'validateRegister', {
                username: this.username,
                email: this.email
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    this.error = res.message;
                    this.isLoading = false;
                    return;
                }
                createUserWithEmailAndPassword(
                    this.authService.getAuth(),
                    this.email,
                    this.password
                )
                    .then(() => {
                        // Signed in
                        // add user to database
                        this.http
                            .post(environment.apiUrl + 'register', {
                                username: this.username,
                                email: this.email
                            })
                            .subscribe((res: any) => {
                                if (res.message != 'OK') {
                                    this.error = res.message;
                                    this.isLoading = false;
                                    return;
                                } else {
                                    this.isLoading = false;
                                    window.location.href = this.redirectUrl;
                                }
                            });
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log('error', errorCode, errorMessage);
                        if (errorCode == 'auth/email-already-in-use') {
                            this.error =
                                "L'adresse email est déjà utilisée par un autre compte.";
                        }
                        if (errorCode == 'auth/invalid-email') {
                            this.error = "L'adresse email n'est pas valide.";
                        }
                        if (errorCode == 'auth/weak-password') {
                            this.error =
                                'Le mot de passe doit contenir au moins 6 caractères.';
                        }
                        this.isLoading = false;
                    });
            });
    }

    enableRegisterWithGoogle() {
        this.isLoading = true;
        signInWithPopup(
            this.authService.getAuth(),
            this.authService.getGoogleProvider()
        )
            .then((result) => {
                // store result
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
        // Signed in
        // add user to database
        this.http
            .post(environment.apiUrl + 'register', {
                username:
                    user.email.split('@')[0].length > 14
                        ? user.email.split('@')[0].substring(0, 14)
                        : user.email.split('@')[0],
                email: user.email,
                avatar: user.photoURL
            })
            .subscribe((res: any) => {
                if (res.message != 'OK') {
                    this.isLoading = false;
                    return;
                } else {
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                }
            });
    }

    passwordVisible = false;
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        this.passwordVisible = !this.passwordVisible;
        passwordInput.type = this.passwordVisible ? 'text' : 'password';
    }

    navigateToLogin() {
        let redirectUrl = this.redirectUrl;
        if (redirectUrl.includes('login') || redirectUrl.includes('register'))
            redirectUrl = '/';
        this.router.navigate([`/login`], {
            queryParams: { redirectUrl: redirectUrl }
        });
    }
}
