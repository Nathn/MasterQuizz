import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    imports: [CommonModule]
})
export class AboutComponent {
    date: Date = new Date();
}
