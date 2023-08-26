import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    userObj: any = localStorage.getItem('userObj')
        ? JSON.parse(localStorage.getItem('userObj') || '')
        : null;
    displayedUser: any;

    error: string = '';

    storage: any;

    isRequestLoading: boolean = true;

    profileEdit: boolean = false;

    tempUsername: string = '';

    avatarName: string = '';
    avatarFile: any = null;
    tempAvatar: string = '';

    constructor(
        private router: Router,
        private ar: ActivatedRoute,
        private http: HttpClient,
        private authService: AuthService
    ) {
        this.storage = getStorage(this.authService.getApp());
        this.authService.onAuthStateChanged(
            this.authService.getAuth(),
            async (user) => {
                if (user) {
                    this.authService
                        .getCurrentUserInfo()
                        .subscribe((userObj: any) => {
                            this.userObj = userObj ? userObj : null;
                        });
                } else {
                    this.userObj = null;
                }
            }
        );
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
                    console.warn(res.message);
                    this.router.navigate(['/']);
                }
            });
    }

    enableEditUsername() {
        this.tempUsername = this.displayedUser.displayName;
        this.profileEdit = true;
    }

    editUsername() {
        if (
            this.userObj._id != this.displayedUser._id ||
            this.tempUsername == this.userObj.displayedName
        ) {
            this.profileEdit = false;
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
                    this.profileEdit = false;
                    if (
                        oldDisplayName.toLowerCase() !=
                        this.userObj.displayName.toLowerCase()
                    ) {
                        window.location.href =
                            '/profile/' + this.tempUsername.toLowerCase();
                    } else if (oldDisplayName != this.userObj.displayName) {
                        window.location.reload();
                    }
                } else {
                    this.error = res.message;
                }
            });
    }

    onAvatarSelected(event: any) {
        this.avatarName = event.target.files[0].name;
        this.avatarFile = event.target.files[0];
        const file = this.avatarFile;
        const storageRef = ref(this.storage, 'avatars/' + file['name']);
        uploadBytes(storageRef, file)
            .then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            })
            .then((downloadURL) => {
                this.tempAvatar = downloadURL; // Store the downloadURL at the correct index
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
            });
    }

    editAvatar() {
        if (this.userObj._id != this.displayedUser._id || !this.avatarFile) {
            this.profileEdit = false;
            return;
        }
        this.http
            .post(environment.apiUrl + 'editAvatar', {
                userId: this.userObj._id,
                avatar: this.tempAvatar,
            })
            .subscribe((res: any) => {
                if (res.message == 'OK') {
                    this.userObj.avatarUrl = this.tempAvatar;
                    this.displayedUser.avatarUrl = this.userObj.avatarUrl;
                    localStorage.setItem(
                        'userObj',
                        JSON.stringify(this.userObj)
                    );
                    this.tempAvatar = '';
                    this.avatarFile = null;
                    this.avatarName = '';
                    this.profileEdit = false;
                } else {
                    this.error = res.message;
                }
            });
    }
}
