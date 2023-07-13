import { Component, Input, Output, EventEmitter } from '@angular/core';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home-module',
  templateUrl: './home-module.component.html',
  styleUrls: ['./home-module.component.scss']
})
export class HomeModuleComponent {
  @Input('question') question: any;
  @Input('ranking') ranking: any = [
    {
      username: "Lorem",
      score: 127
    },
    {
      username: "Ipsum",
      score: 125
    },
    {
      username: "Dolor",
      score: 124
    },
    {
      username: "Sit",
      score: 123
    },
    {
      username: "Amet",
      score: 119
    },
    {
      username: "Consectetur",
      score: 118
    },
    {
      username: "Adipiscing",
      score: 117
    },
    {
      username: "Elit",
      score: 114
    }
  ]
  @Input('moduleTitle') moduleTitle: string = "";
  @Input('moduleType') moduleType: string = "";

  faSpinner = faSpinner;

  constructor() { }

}
