import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, Input, OnChanges,SimpleChanges } from '@angular/core';
import { Role, User } from "src/app/models/user";
import { Quiz } from "src/app/models/quiz";
import * as _ from 'lodash-es';
import { QuizService } from "src/app/services/quiz.service";
import { Router } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { plainToClass } from 'class-transformer';
import { format, formatISO } from 'date-fns';
import { AuthenticationService } from 'src/app/services/authentication.service';


@Component({
    templateUrl: 'quiz.component.html',
    styleUrls: ['quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy{
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    state: MatTableState;
    isTeacher = false;

    filter?: string = '';
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private stateService: StateService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private authentification: AuthenticationService,
    ){
        this.state = this.stateService.quizListState;
    }
    ngOnInit(): void {
        const filt = this.filter;

        if(this.authentification.currentUser?.role === Role.Teacher){
            this.isTeacher = true;
        }
    }
    filterChanged(newfilter: KeyboardEvent){
        const str= (newfilter.target as HTMLInputElement).value;
        this.dataSource.filter = str.trim().toLowerCase();
        this.state.filter = this.dataSource.filter;
        
        this.filter = str;
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
}
