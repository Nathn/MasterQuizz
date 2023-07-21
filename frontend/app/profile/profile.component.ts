import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  user: any = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : null;
  userObj: any;
  displayedUser: any;

  isRequestLoading: boolean = true;

  faSpinner = faSpinner;
  faEdit = faEdit;

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private http: HttpClient
  ) {
    this.ar.params.subscribe(params => {
      this.getUser(params['username']);
    });
  }

  getUser(username: string) {
    this.http.post(environment.apiUrl + "getUserFromUsername", {
      username: username
    }).subscribe((res: any) => {
      if (res.message == "OK" && res.user) {
        this.displayedUser = res.user;
        this.isRequestLoading = false;
      } else {
        alert(res.message);
        this.router.navigate(['/']);
      }
    });
  }

}
