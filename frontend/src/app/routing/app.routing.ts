import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../component/home/home.component';
import { UserListComponent } from '../component/userlist/userlist.component';
import { RestrictedComponent } from '../component/restricted/restricted.component';
import { LoginComponent } from '../component/login/login.component';
import { SignUpComponent } from '../component/signup/signup.component';
import { QuizComponent } from '../component/quiz/quiz.component';
import { UnknownComponent } from '../component/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';
import { QuestionComponent } from '../component/question/question.component';
import { QuizEditionComponent } from '../component/quiz/quiz-edition.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    {
        path: 'users',
        component: UserListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Teacher] }
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignUpComponent
    },
    {
        path: 'quiz',
        component: QuizComponent
    },
    {
        path: 'quizEdition/:id',
        component: QuizEditionComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Teacher] }
    },
    {
        path: 'question/:id',
        component: QuestionComponent
    },
    
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
