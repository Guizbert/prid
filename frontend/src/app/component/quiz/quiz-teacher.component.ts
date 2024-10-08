import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, Input, OnChanges,SimpleChanges } from '@angular/core';
import { Role, User } from "src/app/models/user";
import { Quiz, Statut } from "src/app/models/quiz";
import * as _ from 'lodash-es';
import { QuizService } from "src/app/services/quiz.service";
import { QuestionService } from 'src/app/services/question.service';
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
import { Router } from '@angular/router';
import { Question } from 'src/app/models/question';


@Component({
    selector: 'quizTeacher',
    templateUrl: 'quiz-teacher.component.html',
})
export class QuizTeacherComponent implements OnInit,  AfterViewInit{
    displayedColumns: string[] = ['name', 'database', 'start', 'finish', 'statut', 'isTest', 'actions'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    private user!: User | undefined ;
    haveAnAttempt: boolean = false;
    isAdmin: boolean = false;

    private _question?: Question[] | null;
    get question(): Array<Question> | null {
        return this._question?? null;
    }

    @Input() set question(value: Array<Question> | null) {
        this._question = value;
    }

    private _filter?: string;
    get filter(): string | undefined {
        return this._filter;
    }
    @Input() set filter(value: string | undefined) {
        this._filter = value;
        this.load('setter');
    }

    state: MatTableState;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private quizService: QuizService,
        private questionService: QuestionService,
        private stateService: StateService,
        private authenticationService : AuthenticationService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private router: Router

    ){
        this.state = this.stateService.quizListState;
    }

    ngOnInit(): void {
        // pour check si y a un attempt etc
        this.user = this.authenticationService.currentUser;
        this.isAdmin = this.user?.role == Role.Teacher
    }


    ngAfterViewInit() {
      
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
            // Utilisez les mêmes propriétés que pour isTest true
            var str = data.name + ' ' + data.description + ' ' + data.getstatut + ' ' + data.database?.name;
            
            return str.toLowerCase().includes(filter.toLowerCase());
        }
        
        this.state.bind(this.dataSource);
        this.refresh();
    }  
    
    edit(quizid: number) {
        this.router.navigate(['/quizEdition/'+quizid]);
    }   


    refresh(){
        if(this.user?.role == Role.Teacher){
            this.quizService.getAll( this.user.id).subscribe(quizzes => {
                console.log(quizzes);
                this.dataSource.data = quizzes;
                this.filter = this.state.filter;
            }) 
        }
    }

    load(from: string): void {
        this.dataSource.filter = this.filter?? "";
    }

    
}
