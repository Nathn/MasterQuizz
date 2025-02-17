import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-question',
    standalone: true,
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
    imports: [CommonModule, FontAwesomeModule]
})
export class QuestionComponent implements OnInit {
    @Input('question') question: any;
    @Input('answerValidated') answerValidated: boolean = false;
    @Input('selectedAnswerIndex') selectedAnswerIndex: number = -1;
    @Input('questionOptions') questionOptions: any = {} as any;

    @Output() selectedAnswer = new EventEmitter();

    shuffledAnswers: any[] = [];

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        // if queestions is changed, shuffle the answers
        if (changes['question']) {
            this.shuffledAnswers = this.shuffleArray(
                this.question.answers.slice()
            );
        }
    }

    ngOnInit() {
        // Create a shuffled copy of the answers array
        this.shuffledAnswers = this.shuffleArray(this.question.answers.slice());
    }

    shuffleArray(array: any[]) {
        // Shuffle the array using the Fisher-Yates algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getOriginalIndex(index: number) {
        // Get the original index of the answer in the answers array
        return this.question.answers.indexOf(this.shuffledAnswers[index]);
    }

    selectAnswer(index: number) {
        if (this.selectedAnswerIndex == index) {
            this.selectedAnswerIndex = -1;
        } else {
            this.selectedAnswerIndex = index;
        }
        this.selectedAnswer.emit(this.selectedAnswerIndex);
    }
}
