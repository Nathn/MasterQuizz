import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { WebSocketService } from '../websocket.service';

import { faSpinner, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  user: any = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : null;
  userObj: any = localStorage.getItem("userObj") ? JSON.parse(localStorage.getItem("userObj") || "") : null;
  duelId: string = "";
  duelObj: any = null;

  destroyed$ = new Subject();

  faSpinner = faSpinner;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;

  isRequestLoading: boolean = false;

  status: string = "";

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private http: HttpClient,
    private ws: WebSocketService,
  ) {
    if (!this.user)
      this.router.navigate(['/login']);
    ar.params.subscribe(params => {
      if (params['id'])
        this.duelId = params['id'];
      this.http.post(environment.apiUrl + "getUserFromEmail", {
        email: this.user.email
      }).subscribe((response: any) => {
        if (response.message != "OK") {
          alert(response.message);
        } else {
          this.userObj = response.user;
          if (!this.userObj)
            this.router.navigate(['']);
        }
      });
    });
  }

  ngOnInit(): void {
    this.ws.connect().pipe(
      takeUntil(this.destroyed$)
    ).subscribe((message: any) => {
      if (message.type == "duel") {
        if (message.status == "waiting") {
          this.status = "Recherche d'adversaire en cours...";
        } else if (message.status == "ready") {
          this.router.navigate(['duel', message.match._id]);
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(0);
    this.ws.closeConnection();
  }

  findMatch() {
    this.ws.send({
      type: "duel",
      action: "find",
      user: this.userObj._id
    });
  }

  cancelSearch() {
    this.status = "";
    this.ws.send({
      type: "duel",
      action: "cancel",
      user: this.userObj._id
    });
  }

}
