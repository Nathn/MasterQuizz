import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-cgu',
    templateUrl: './cgu.component.html',
    styleUrls: ['./cgu.component.scss']
})
export class CguComponent {
    page: string | undefined = '';

    constructor(private router: Router, private ar: ActivatedRoute) {
        this.page = this.ar.snapshot.url[0]?.path;
    }
}
