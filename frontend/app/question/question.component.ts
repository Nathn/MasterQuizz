import { Component, Input, Output, EventEmitter } from '@angular/core';

import { faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent {
  @Input('question') question: any;
  @Input('answerValidated') answerValidated: boolean = false;

  @Output() selectedAnswer = new EventEmitter();

  faSpinner = faSpinner;
  faCheck = faCheck;
  faTimes = faTimes;

  selectedAnswerIndex: number = -1;

  constructor() { }

  selectAnswer(index: number) {
    if (this.selectedAnswerIndex == index) {
      this.selectedAnswerIndex = -1;
    } else {
      this.selectedAnswerIndex = index;
    }
    this.selectedAnswer.emit(this.selectedAnswerIndex);
  }

}
