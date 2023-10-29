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

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        UserListComponent,
        LoginComponent,
        UnknownComponent,
        RestrictedComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutes
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
