import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {
  private connection$: WebSocketSubject<any> | null = null;

  constructor(private store: Store<object>) { }

  connect(): Observable<any> {
    if (!this.connection$ || this.connection$.closed) {
      this.connection$ = webSocket(environment.wsUrl);
    } else {
      console.error('Attempted to open multiple connections');
    }
    return this.connection$;
  }

  send(data: any) {
    if (this.connection$) {
      this.connection$.next(data);
    } else {
      console.error('Did not send data, open a connection first');
    }
  }

  closeConnection() {
    if (this.connection$) {
      this.connection$.complete();
      this.connection$ = null;
    }
  }

  ngOnDestroy() {
    this.closeConnection();
  }
}
