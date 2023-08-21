import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';

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

import {
    FontAwesomeModule,
    FaIconLibrary,
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
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

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
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        StoreModule.forRoot({}),
        FontAwesomeModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(
            faSpinner,
            faCheck,
            faTimes,
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
            faStar
        );
    }
}
