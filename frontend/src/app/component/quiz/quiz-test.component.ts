import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { User } from "src/app/models/user";
// import { Quizzes } from "src/app/component/quiz/Quizzes.component";
// import { Test } from "src/app/component/quiz/Test.component";
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
    selector: 'quizTest',
    templateUrl: 'quiz-test.component.html',
})
export class QuizTestComponent implements AfterViewInit{
    displayedColumns: string[] = ['name', 'description', 'start', 'finish', 'statut', 'isTest' , 'actions'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    // test: Test[] = [];
    filter: string ="";
    state: MatTableState;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor( private quizService: QuizService,
        private stateService: StateService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private route: Router
    ){
        this.state = this.stateService.quizListState;
    }
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Quiz, filter: string)=> {
            const str =data.name + ' ' + data.description + ' '+(data.start ? format(data.start!, 'dd/MM/yyyy') : '') + ' '+(data.finish ? format(data.finish!, 'dd/MM/yyyy') : '');
            return str.toLowerCase().includes(filter);
        }
        this.state.bind(this.dataSource);
        this.refresh();
    }

    edit(quiz: Quiz){
        console.log(quiz);
    }

    refresh(){
        this.quizService.getQuizzes().subscribe(quizzes => {
            this.dataSource.data = quizzes;
        })
    }

    

    //utiliser dialog pour delete?
    
}
