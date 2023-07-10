import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss']
})
export class AddQuestionComponent {

  user: any = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "") : null;
  userObj: any;

  auth: any;
  db: any;

  faSpinner = faSpinner;

  isAuthLoading: boolean = true;
  isRequestLoading: boolean = false;

  themes: {
    name: string,
    code: string
  }[] = [];

  question: string = "";
  nbAnswers: number = 4;
  answers: string[] = [];
  goodAnswer: number = 0;
  theme: string = "";
  difficulty: number = 1;

  constructor(
    private router: Router,
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
            this.isAuthLoading = false;
          }
        });
      }
    });
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

}
