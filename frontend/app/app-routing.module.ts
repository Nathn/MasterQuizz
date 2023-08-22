import { NgModule } from '@angular/core';
import { RouterModule, type Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { DuelComponent } from './duel/duel.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AboutComponent } from './about/about.component';
import { QuestionsComponent } from './questions/questions.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'about', component: AboutComponent },
    { path: 'leaderboard', component: LeaderboardComponent },
    { path: 'profile/:username', component: ProfileComponent },
    { path: 'questions', component: QuestionsComponent },
    { path: 'questions/:action', component: QuestionsComponent },
    { path: 'questions/:action/:id', component: QuestionsComponent },
    { path: 'multiplayer', component: DuelComponent },
    { path: 'multiplayer/:id', component: DuelComponent },
    { path: 'duel/:id', component: DuelComponent },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
