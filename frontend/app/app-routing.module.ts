import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { PracticeComponent } from './practice/practice.component';
import { DuelComponent } from './duel/duel.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { QuestionsComponent } from './questions/questions.component';
import { AboutComponent } from './about/about.component';
import { CguComponent } from './cgu/cgu.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'login/:action', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'practice', component: PracticeComponent },
    { path: 'practice/:action', component: PracticeComponent },
    { path: 'practice/:action/:id', component: PracticeComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: 'about', component: AboutComponent },
    { path: 'privacy', component: CguComponent },
    { path: 'terms', component: CguComponent },
    { path: 'profile/:username', component: ProfileComponent },
    { path: 'questions', component: QuestionsComponent },
    { path: 'questions/:action', component: QuestionsComponent },
    { path: 'questions/:action/:id', component: QuestionsComponent },
    { path: 'multiplayer', component: DuelComponent },
    { path: 'multiplayer/:id', component: DuelComponent },
    { path: 'duel/:id', component: DuelComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
