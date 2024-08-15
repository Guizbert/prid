import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutes } from '../routing/app.routing';
import { AppComponent } from '../component/app/app.component';
import { NavMenuComponent } from '../component/nav-menu/nav-menu.component';
import { HomeComponent } from '../component/home/home.component';
import { UserListComponent } from '../component/userlist/userlist.component';
import { RestrictedComponent } from '../component/restricted/restricted.component';
import { UnknownComponent } from '../component/unknown/unknown.component';
import { JwtInterceptor } from '../interceptors/jwt.interceptor';
import { LoginComponent } from '../component/login/login.component';
import { SignUpComponent } from '../component/signup/signup.component';
import { QuizComponent } from '../component/quiz/quiz.component';
import { QuizEditionComponent } from '../component/quiz/quiz-edition.component';
import { QuizTrainingComponent } from '../component/quiz/quiz-training.component';
import { QuizTeacherComponent}  from '../component/quiz/quiz-teacher.component';
import { QuestionComponent } from '../component/question/question.component';
import { CodeEditorComponent } from '../component/code-editor/code-editor.component';
import { Exam1 } from '../component/exam1/exam1.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared.module';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { fr } from 'date-fns/locale';
import { ExitDialogComponent } from '../component/question/ExitDialogComponent';
import { ConfirmDeleteComponent } from '../component/quiz/ConfirmDelete.component';
import { TruncatePipe } from '../helpers/truncatePipe ';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        UserListComponent,
        LoginComponent,
        SignUpComponent,
        QuizComponent,
        QuizTeacherComponent,
        QuizTrainingComponent,
        ConfirmDeleteComponent,
        QuizEditionComponent,
        QuestionComponent,
        Exam1,
        UnknownComponent,
        CodeEditorComponent,
        RestrictedComponent,
        ExitDialogComponent,
        TruncatePipe
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
