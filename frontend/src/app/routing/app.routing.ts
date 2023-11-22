import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../component/home/home.component';
import { CounterComponent } from '../component/counter/counter.component';
import { FetchDataComponent } from '../component/fetch-data/fetch-data.component';
import { UserListComponent } from '../component/userlist/userlist.component';
import { RestrictedComponent } from '../component/restricted/restricted.component';
import { LoginComponent } from '../component/login/login.component';
import { SignUpComponent } from '../component/signup/signup.component';
import { QuizComponent } from '../component/quiz/quiz.component';
import { UnknownComponent } from '../component/unknown/unknown.component';
import { AuthGuard } from '../services/auth.guard';
import { Role } from '../models/user';

const appRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'counter', component: CounterComponent },
    { path: 'fetch-data', component: FetchDataComponent },
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
    { path: 'restricted', component: RestrictedComponent },
    { path: '**', component: UnknownComponent }
];

export const AppRoutes = RouterModule.forRoot(appRoutes);
