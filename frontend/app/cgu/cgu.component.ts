import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-cgu',
    standalone: true,
    templateUrl: './cgu.component.html',
    styleUrls: ['./cgu.component.scss'],
    imports: [CommonModule]
})
export class CguComponent {
    page: string | undefined = '';

    constructor(private router: Router, private ar: ActivatedRoute) {
        this.page = this.ar.snapshot.url[0]?.path;
    }
}
