import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input('question') question: any;
    @Input('answerValidated') answerValidated: boolean = false;
    @Input('selectedAnswerIndex') selectedAnswerIndex: number = -1;
    @Input('questionOptions') questionOptions: any = {} as any;

    @Output() selectedAnswer = new EventEmitter();

    constructor() {}

    selectAnswer(index: number) {
        if (this.selectedAnswerIndex == index) {
            this.selectedAnswerIndex = -1;
        } else {
            this.selectedAnswerIndex = index;
        }
        this.selectedAnswer.emit(this.selectedAnswerIndex);
    }
}
