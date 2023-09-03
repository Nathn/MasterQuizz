import {
    Component,
    Input,
    Output,
    EventEmitter,
    SimpleChanges
} from '@angular/core';

@Component({
    selector: 'app-home-module',
    templateUrl: './home-module.component.html',
    styleUrls: ['./home-module.component.scss']
})
export class HomeModuleComponent {
    @Input('question') question: any;
    @Input('ranking') ranking: any;
    @Input('moduleTitle') moduleTitle: string = '';
    @Input('moduleType') moduleType: string = '';
    @Input('moduleParams') moduleParams: any = {} as any;

    @Output() selectedAnswer = new EventEmitter();
    @Output() validatedAnswer = new EventEmitter();
    @Output() nextQuestion = new EventEmitter();

    selectedAnswerIndex: number = -1;
    answerValidated: boolean = false;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        // if moduleParams.answerValidated is changed, change answerValidated
        if (
            changes['moduleParams'] &&
            changes['moduleParams'].currentValue &&
            changes['moduleParams'].currentValue.answerValidated
        ) {
            this.answerValidated =
                changes['moduleParams'].currentValue.answerValidated;
        }
    }

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
