import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent {

  user: any = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : null;
  userObj: any;
  action: string = "";

  auth: any;
  db: any;

  faSpinner = faSpinner;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;

  isAuthLoading: boolean = true;
  isRequestLoading: boolean = false;

  themes: {
    name: string,
    code: string
  }[] = [];
  validActions: string[] = ["add", "manage"];
  questionsList: {
    _id: string,
    question: string,
    created: Date,
    nbAnswers: number,
    answers: {
      answer: string,
      correct: boolean
    }[],
    goodAnswer: number,
    theme: {
      name: string,
      code: string
    },
    difficulty: number,
    user: {
      username: string
    }
  }[] = [];

  search: string = "";

  question: string = "";
  nbAnswers: number = 4;
  answers: string[] = [];
  goodAnswer: number = 0;
  theme: string = "";
  difficulty: number = 1;

  constructor(
    private router: Router,
    private ar: ActivatedRoute,
    private http: HttpClient
  ) {
    if (!this.user)
      this.router.navigate(['']);
    this.http.post(environment.apiUrl + "getUserFromEmail", {
      email: this.user.email
    }).subscribe((response: any) => {
      if (response.message != "OK") {
        alert(response.message);
      } else {
        this.userObj = response.user;
        if (!this.userObj.admin)
          this.router.navigate(['']);
        this.http.post(environment.apiUrl + "getAllThemes", {
        }).subscribe((response: any) => {
          if (response.message != "OK") {
            alert(response.message);
          } else {
            this.themes = response.themes;
            ar.params.subscribe(params => {
              this.action = params['action'];
              if (!this.validActions.includes(this.action))
                this.router.navigate(['/questions/manage']);
              if (this.action == "manage")
                this.getQuestions();
              this.isAuthLoading = false;
            });
          }
        });
      }
    });
  }

  async getQuestions() {
    this.isRequestLoading = true;
    this.http.post(environment.apiUrl + "getAllQuestions", {
      user: this.userObj._id
    }).subscribe((response: any) => {
      if (response.message != "OK") {
        alert(response.message);
      } else {
        this.questionsList = response.questions;
        this.isRequestLoading = false;
      }
    });
  }

  getQuestionsFiltered() {
    let filteredQuestions: any[] = [];
    for (let question of this.questionsList) {
      if (question.question.toLowerCase().includes(this.search.toLowerCase())) {
        filteredQuestions.push(question);
        continue;
      }
      if (question.theme.name.toLowerCase().includes(this.search.toLowerCase())) {
        filteredQuestions.push(question);
        continue;
      }
      if (question.user.username.toLowerCase().includes(this.search.toLowerCase())) {
        filteredQuestions.push(question);
        continue;
      }
      for (let answer of question.answers) {
        if (answer.answer.toLowerCase().includes(this.search.toLowerCase())) {
          filteredQuestions.push(question);
          continue;
        }
      }
    }
    return filteredQuestions;
  }

  addQuestion() {
    this.isRequestLoading = true;
    let formattedAnswers: any[] = [];
    for (let i = 0; i < this.nbAnswers; i++) {
      formattedAnswers.push({
        answer: this.answers[i],
        correct: i == this.goodAnswer
      });
    }
    this.http.post(environment.apiUrl + "createQuestion", {
      question: this.question,
      nbAnswers: this.nbAnswers,
      answers: formattedAnswers,
      goodAnswer: this.goodAnswer,
      theme: this.theme,
      difficulty: this.difficulty,
      user: this.userObj._id
    }).subscribe((response: any) => {
      if (response.message != "OK") {
        alert(response.message);
      } else {
        alert("Question ajoutée !");
        // reset form
        this.question = "";
        this.nbAnswers = 4;
        this.answers = [];
        this.goodAnswer = 0;
        this.theme = "";
        this.difficulty = 1;
      }
      this.isRequestLoading = false;
    });
  }

  editQuestion(question: any) {
  }

  deleteQuestion(question: any) {
  }

}
