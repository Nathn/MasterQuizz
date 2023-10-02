import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private connection$: WebSocketSubject<any> | null = null;
    private pingInterval: any;

    constructor() {}

    connect(): Observable<any> {
        if (!this.connection$ || this.connection$.closed) {
            this.connection$ = webSocket(environment.wsUrl);
            this.pingInterval = setInterval(() => {
                this.ping();
            }, 5000);
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
            console.warn('Closing connection');
            this.connection$.complete();
            this.connection$ = null;
        }
    }

    ping() {
        this.send({ type: 'ping' });
    }

    ngOnDestroy() {
        this.closeConnection();
        clearInterval(this.pingInterval);
    }
}
