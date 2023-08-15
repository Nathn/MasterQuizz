import { Component, type OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    email: string = '';
    username: string = '';
    password: string = '';

    auth: any;
    googleProvider: any = new GoogleAuthProvider();

    faSpinner = faSpinner;
    faGoogle = faGoogle;

    isLoading: boolean = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private zone: NgZone
    ) {
        let app = initializeApp(environment.firebaseConfig);
        this.auth = getAuth(app);
        this.auth.languageCode = 'fr';
        onAuthStateChanged(this.auth, (user) => {
            if (user) this.router.navigate(['']);
        });
    }

    ngOnInit(): void {
        // gives focus to the first input
        document.getElementById('username')?.focus();
    }

    register() {
        this.isLoading = true;
        // check password length
        if (this.password.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        // check if all the info is valid through api
        this.http
            .post(environment.apiUrl + 'validateRegister', {
                username: this.username,
                email: this.email,
            })
            .subscribe((response: any) => {
                if (response.message != 'OK') {
                    alert(response.message);
                    this.isLoading = false;
                    return;
                }
                createUserWithEmailAndPassword(
                    this.auth,
                    this.email,
                    this.password
                )
                    .then(() => {
                        // Signed in
                        // add user to database
                        this.http
                            .post(environment.apiUrl + 'register', {
                                username: this.username,
                                email: this.email,
                            })
                            .subscribe((response: any) => {
                                if (response.message != 'OK') {
                                    alert(response.message);
                                    this.isLoading = false;
                                    return;
                                } else {
                                    this.router.navigate(['']);
                                }
                            });
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log('error', errorCode, errorMessage);
                        if (errorCode == 'auth/email-already-in-use') {
                            alert(
                                "L'adresse email est déjà utilisée par un autre compte."
                            );
                        }
                        if (errorCode == 'auth/invalid-email') {
                            alert("L'adresse email n'est pas valide.");
                        }
                        if (errorCode == 'auth/weak-password') {
                            alert(
                                'Le mot de passe doit contenir au moins 6 caractères.'
                            );
                        }
                        this.isLoading = false;
                    });
            });
    }

    enableRegisterWithGoogle() {
        this.isLoading = true;
        signInWithPopup(this.auth, this.googleProvider)
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
                    this.router.navigate(['']);
                }
            });
    }
}
