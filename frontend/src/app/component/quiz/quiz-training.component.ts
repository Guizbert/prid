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
export class QuizTrainingComponent implements AfterViewInit{
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

    // ngOnChanges(changes: SimpleChanges): void {
    //     console.log(changes.filter.currentValue + "  <--- changes dans quiz training ");
        
    //     console.log(this.dataSource);
    //     this.state.bind(this.dataSource);
    //     this.refresh();
    // }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: Quiz, filter: string)=> {
            const str =data.name + ' ' + data.description + ' '+
                        (data.start ? format(data.start!, 'dd/MM/yyyy') : '') + ' '+
                                (data.finish ? format(data.finish!, 'dd/MM/yyyy') : '');
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
            console.log(quizzes);
            //this.state.restoreState(this.dataSource); <-
            this.filter = this.state.filter;
        })
    }

    load(from: string): void {
        this.dataSource.filter = this.filter?? "";
        console.log(from, 'do something with the filter ', this.filter + "  load quiz-training");
    }

    
}
