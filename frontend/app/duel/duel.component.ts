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
  startedDuelId: string = "";

  destroyed$ = new Subject();

  faSpinner = faSpinner;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;

  isRequestLoading: boolean = true;

  status: string = "";

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private http: HttpClient,
    private ws: WebSocketService,
  ) {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    ar.params.subscribe(params => {
      if (params['id']) {
        this.duelId = params['id'];
        this.status = "Match trouvé ! En attente de l'adversaire..."
      }
      this.http.post(environment.apiUrl + "getUserFromEmail", {
        email: this.user.email
      }).subscribe((response: any) => {
        if (response.message != "OK") {
          alert(response.message);
        } else {
          this.userObj = response.user;
          if (!this.userObj)
            this.router.navigate(['']);
          if (!this.duelId) {
            this.http.post(environment.apiUrl + "getCurrentDuelFromUser", {
              user: this.userObj._id
            }).subscribe((response: any) => {
              if (response.message != "OK") {
                alert(response.message);
              } else {
                if (response.match) {
                  this.startedDuelId = response.match._id;
                  this.status = "Match en cours...";
                }
                this.isRequestLoading = false;
              }
            });
          } else {
            this.isRequestLoading = false;
          }
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
        } else if (message.status == "cancelled") {
          this.status = "";
        } else if (message.status == "started") {
          this.status = "";
          this.duelObj = message.match;
        } else if (message.status == "not found") {
          this.router.navigate(['multiplayer']);
        }
      }
    });
    if (this.duelId) {
      this.startMatch();
    }
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

  joinMatch() {
    this.router.navigate(['duel', this.startedDuelId]);
  }

  cancelSearch() {
    this.ws.send({
      type: "duel",
      action: "cancel",
      user: this.userObj._id
    });
  }

  startMatch() {
    this.ws.send({
      type: "duel",
      action: "start",
      user: this.userObj._id,
      match: this.duelId
    });
  }

}
