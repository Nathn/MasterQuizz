import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner, faEdit, faCheck } from '@fortawesome/free-solid-svg-icons';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    user: any = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '')
        : null;
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    displayedUser: any;

    isRequestLoading: boolean = true;

    faSpinner = faSpinner;
    faEdit = faEdit;
    faCheck = faCheck;

    tempUsername: string = '';
    usernameEdit: boolean = false;

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient
    ) {
        this.ar.params.subscribe((params) => {
            this.getUser(params['username']);
        });
    }

    getUser(username: string) {
        this.http
            .post(environment.apiUrl + 'getUserFromUsername', {
                username: username,
            })
            .subscribe((res: any) => {
                if (res.message == 'OK' && res.user) {
                    this.displayedUser = res.user;
                    this.isRequestLoading = false;
                } else {
                    alert(res.message);
                    this.router.navigate(['/']);
                }
            });
    }

    enableEditUsername() {
        this.tempUsername = this.displayedUser.displayName;
        this.usernameEdit = true;
    }

    editUsername() {
        if (this.userObj._id != this.displayedUser._id) {
            return;
        }
        if (this.tempUsername == this.userObj.displayedName) {
            this.usernameEdit = false;
            return;
        }
        let oldDisplayName = this.userObj.displayName;
        this.http
            .post(environment.apiUrl + 'editUsername', {
                userId: this.userObj._id,
                username: this.tempUsername,
            })
            .subscribe((res: any) => {
                if (res.message == 'OK') {
                    this.userObj.username = this.tempUsername.toLowerCase();
                    this.userObj.displayName = this.tempUsername;
                    this.displayedUser.displayedName = this.userObj.displayName;
                    this.displayedUser.username = this.userObj.username;
                    localStorage.setItem(
                        'userObj',
                        JSON.stringify(this.userObj)
                    );
                    this.usernameEdit = false;
                    if (
                        oldDisplayName.toLowerCase() !=
                        this.userObj.displayName.toLowerCase()
                    ) {
                        window.location.href =
                            '/profile/' + this.tempUsername.toLowerCase();
                    } else {
                        window.location.reload();
                    }
                } else {
                    alert(res.message);
                }
            });

        this.usernameEdit = false;
    }
}
