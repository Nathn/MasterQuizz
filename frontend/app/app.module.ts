import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import {
    NgcCookieConsentModule,
    NgcCookieConsentConfig
} from 'ngx-cookieconsent';
const cookieConfig: NgcCookieConsentConfig = {
    cookie: {
        domain: environment.cookieDomain
    },
    palette: {
        popup: {
            background: '#13375e'
        },
        button: {
            background: '#102741'
        }
    },
    theme: 'classic',
    type: 'opt-out',
    content: {
        header: 'Cookies utilisés sur le site!',
        message:
            'Ce site utilise des cookies pour vous offrir la meilleure expérience de navigation.',
        dismiss: 'Compris!',
        allow: 'Accepter les cookies',
        deny: 'Refuser',
        link: 'En savoir plus',
        policy: 'Politique de cookies'
    }
};

import {
    FontAwesomeModule,
    FaIconLibrary
} from '@fortawesome/angular-fontawesome';

import {
    faSpinner,
    faCheck,
    faTimes,
    faCircleXmark,
    faXmark,
    faBars,
    faSignInAlt,
    faUserPlus,
    faSignOutAlt,
    faEdit,
    faTrash,
    faPlus,
    faStar,
    faUpload,
    faPaperPlane,
    faCircleCheck,
    faCircleDot,
    faEye,
    faDoorOpen,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
    faEye as faEyeRegular,
    faEyeSlash
} from '@fortawesome/free-regular-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { QuestionsComponent } from './questions/questions.component';
import { HomeModuleComponent } from './home-module/home-module.component';
import { QuestionComponent } from './question/question.component';
import { ProfileComponent } from './profile/profile.component';
import { DuelComponent } from './duel/duel.component';
import { AboutComponent } from './about/about.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { PracticeComponent } from './practice/practice.component';
import { CguComponent } from './cgu/cgu.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        QuestionsComponent,
        HomeModuleComponent,
        QuestionComponent,
        ProfileComponent,
        DuelComponent,
        AboutComponent,
        LeaderboardComponent,
        PracticeComponent,
        CguComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        StoreModule.forRoot({}),
        FontAwesomeModule,
        NgcCookieConsentModule.forRoot(cookieConfig)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(
            faSpinner,
            faCheck,
            faTimes,
            faCircleCheck,
            faCircleXmark,
            faXmark,
            faBars,
            faSignInAlt,
            faUserPlus,
            faSignOutAlt,
            faGoogle,
            faEdit,
            faTrash,
            faPlus,
            faStar,
            faUpload,
            faPaperPlane,
            faCircleDot,
            faEye,
            faEyeRegular,
            faEyeSlash,
            faDoorOpen,
            faExclamationTriangle
        );
    }
}
