import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutes } from '../routing/app.routing';

import { AppComponent } from '../component/app/app.component';
import { NavMenuComponent } from '../component/nav-menu/nav-menu.component';
import { HomeComponent } from '../component/home/home.component';
import { CounterComponent } from '../component/counter/counter.component';
import { FetchDataComponent } from '../component/fetch-data/fetch-data.component';
import { UserListComponent } from '../component/userlist/userlist.component';
import { RestrictedComponent } from '../component/restricted/restricted.component';
import { UnknownComponent } from '../component/unknown/unknown.component';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { LoginComponent } from '../component/login/login.component';
import { SignUpComponent } from '../component/signup/signup.component';
import { QuizComponent } from '../component/quiz/quiz.component';
import { QuizTrainingComponent } from '../component/quiz/quiz-training.component';
import { QuestionComponent } from '../component/question/question.component';
import { CodeEditorComponent } from '../component/code-editor/code-editor.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { fr } from 'date-fns/locale';
import { ExitDialogComponent } from '../component/question/ExitDialogComponent';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        UserListComponent,
        LoginComponent,
        SignUpComponent,
        QuizComponent,
        QuizTrainingComponent,
        QuestionComponent,
        UnknownComponent,
        CodeEditorComponent,
        RestrictedComponent,
        ExitDialogComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutes,
        BrowserAnimationsModule,
        SharedModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: MAT_DATE_LOCALE, useValue: fr },
        {
          provide: MAT_DATE_FORMATS,
          useValue: {
            parse: {
              dateInput: ['dd/MM/yyyy'],
            },
            display: {
              dateInput: 'dd/MM/yyyy',
              monthYearLabel: 'MMM yyyy',
              dateA11yLabel: 'dd/MM/yyyy',
              monthYearA11yLabel: 'MMM yyyy',
            },
          },
        },
      ],
    bootstrap: [AppComponent]
})
export class AppModule { }
