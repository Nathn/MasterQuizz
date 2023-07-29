import { Component, Input, Output, EventEmitter } from '@angular/core';

import { faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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
    }
  ]
  @Input('moduleTitle') moduleTitle: string = "";
  @Input('moduleType') moduleType: string = "";
  @Input('moduleParams') moduleParams: any = {} as any;

  @Output() selectedAnswer = new EventEmitter();
  @Output() validatedAnswer = new EventEmitter();
  @Output() nextQuestion = new EventEmitter();

  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;

  selectedAnswerIndex: number = -1;
  answerValidated: boolean = false;

  constructor() { }

  selectAnswer(event: any) {
    this.selectedAnswer.emit(event);
    this.selectedAnswerIndex = event;
  }

  validateAnswer() {
    this.validatedAnswer.emit(this.selectedAnswerIndex);
    this.answerValidated = true;
  }

  next() {
    this.nextQuestion.emit(this.selectedAnswerIndex);
    this.answerValidated = false;
    this.selectedAnswerIndex = -1;
  }

}
