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

    TIME_LIMIT: number = 30000;

    selectedAnswerIndex: number = -1;
    answerValidated: boolean = false;
    timeLeft: string = '';
    timerColor: string = '';
    timerInterval: any;

    constructor() {
        if (this.moduleParams.matchObj && this.moduleParams.matchObj.timeLimits)
            this.timerInterval = setInterval(() => {
                this.updateTimeLeft();
            }, 1000);
    }

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
        if (
            this.moduleParams.matchObj &&
            this.moduleParams.matchObj.timeLimits
        ) {
            this.updateTimeLeft();
            if (!this.timerInterval)
                this.timerInterval = setInterval(() => {
                    this.updateTimeLeft();
                }, 1000);
        }
    }

    updateTimeLeft() {
        const timeLimit =
            this.moduleParams.matchObj.timeLimits[
                this.moduleParams.currentQuestionIndex
            ];
        const now = new Date().getTime();
        const endTime = timeLimit;
        const timeLeft = endTime - now;
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        this.timeLeft = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        let secondsPassed = this.TIME_LIMIT - timeLeft;
        if (secondsPassed > this.TIME_LIMIT / 2) {
            this.timerColor = `rgb(255, ${Math.floor(
                255 - (secondsPassed / this.TIME_LIMIT) * 255
            )}, ${Math.floor(255 - (secondsPassed / this.TIME_LIMIT) * 255)})`;
        } else {
            this.timerColor = '';
        }
        // if time is up, validate answer
        if (timeLeft < 0) {
            this.validateAnswer();
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
