import { Component, NgZone, type OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    username: string = '';
    email: string = '';
    password: string = '';

    auth: any;
    db: any;
    googleProvider: any = new GoogleAuthProvider();

    faSpinner = faSpinner;
    faGoogle = faGoogle;

    isLoading: boolean = false;

    redirectUrl: string = '';

    constructor(
        private ar: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private zone: NgZone
    ) {
        let app = initializeApp(environment.firebaseConfig);
        this.auth = getAuth(app);
        this.auth.languageCode = 'fr';
        this.redirectUrl = this.ar.snapshot.queryParams['redirectUrl'] || '';
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                this.isLoading = true;
                this.getUserInfo(user.email);
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('userObj');
            }
            this.isLoading = false;
        });
    }

    ngOnInit(): void {
        // gives focus to the first input
        document.getElementById('username')?.focus();
    }

    getUserInfo(email: string | null) {
        this.http
            .post(environment.apiUrl + 'getUserFromEmail', {
                email: email,
            })
            .subscribe((response: any) => {
                if (response.message != 'OK') {
                    localStorage.removeItem('user');
                    localStorage.removeItem('userObj');
                    this.isLoading = false;
                } else {
                    localStorage.setItem(
                        'userObj',
                        JSON.stringify(response.user)
                    );
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                }
            });
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
                this.email = response.email;
                signInWithEmailAndPassword(this.auth, this.email, this.password)
                    .then((userCredential) => {
                        // Signed in
                        const user = userCredential.user;
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
        signInWithPopup(this.auth, this.googleProvider)
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
                    this.isLoading = false;
                    return;
                } else {
                    this.isLoading = false;
                    this.router.navigate([this.redirectUrl]);
                }
            });
    }
}
