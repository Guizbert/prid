import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, Input, OnChanges,SimpleChanges } from '@angular/core';
import { User } from "src/app/models/user";
// import { Quizzes } from "src/app/component/quiz/Quizzes.component";
// import { Test } from "src/app/component/quiz/Test.component";
import { Quiz } from "src/app/models/quiz";
import * as _ from 'lodash-es';
import { QuizService } from "src/app/services/quiz.service";
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
    selector: 'quizTraining',
    templateUrl: 'quiz-training.component.html',
})
export class QuizTrainingComponent implements OnInit, AfterViewInit{
    displayedColumns: string[] = ['name', 'description', 'start', 'finish', 'statut', 'isTest', 'actions'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();

    private _filter?: string;
    get filter(): string | undefined {
        return this._filter;
    }
    
    @Input() set filter(value: string | undefined) {
        this._filter = value;
        this.load('setter');
    }
    private _isTest?: boolean;

    get isFilter(): boolean | undefined {
        return this._isTest;
    }
    @Input() set isTest(value: boolean | undefined) {
        this._isTest = value;
        this.load('setter');
    }    
    state: MatTableState;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private quizService: QuizService,
        private stateService: StateService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar
    ){
        this.state = this.stateService.quizListState;
    }

    ngOnInit(): void {
       
    }
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
            // Utilisez les mêmes propriétés que pour isTest true
            var str = data.name + ' ' + data.description + ' ' + data.statut + ' ';
            // if (this._isTest) {
            //     if (data.start instanceof Date && !isNaN(data.start.getTime())) {
            //         str += 'Début: ' + format(data.start!, 'dd/MM/yyyy') + ' ';
            //     }
                
            //     if (data.finish instanceof Date && !isNaN(data.finish.getTime())) {
            //         str += 'Fin: ' + format(data.finish!, 'dd/MM/yyyy') + ' ';
            //     }
            // }
            return str.toLowerCase().includes(filter.toLowerCase());
        }
        
        this.state.bind(this.dataSource);
        this.refresh();
    }
    

    edit(quiz: Quiz){
        console.log(quiz);
    }
    refresh(){
        if(this._isTest){
            this.quizService.getTest().subscribe(quizzes => {
                this.dataSource.data = quizzes;
                this.filter = this.state.filter;
            })
        }else
        {    this.quizService.getQuizzes().subscribe(quizzes => {
                this.dataSource.data = quizzes;
                //this.state.restoreState(this.dataSource); <-
                this.filter = this.state.filter;
            })
        }
    }

    load(from: string): void {
        this.dataSource.filter = this.filter?? "";
        
        console.log(from, 'do something with the filter ', this.filter + "  load quiz-training");

    }

    
}
