import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Role, User } from "src/app/models/user";
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
    templateUrl: 'quiz.component.html',
    styleUrls: ['quiz.component.css']
})
export class QuizComponent implements OnInit, AfterViewInit, OnDestroy{
    displayedColumns: string[] = ['name', 'description', 'start', 'finish', 'isTest'];
    dataSource: MatTableDataSource<Quiz> = new MatTableDataSource();
    // test: Test[] = [];
    filter: string ="";
    state: MatTableState;
    isTeacher = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor( private quizService: QuizService,
        private stateService: StateService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private authentification: AuthenticationService,
    ){
        this.state = this.stateService.quizListState;
    }
    ngOnInit(): void {
        if(this.authentification.currentUser?.role === Role.Teacher){
            this.isTeacher = true;
        }
    }
    ngAfterViewInit(): void {
        
        // lie le datasource au sorter et au paginator
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // définit le predicat qui doit être utilisé pour filtrer les membres
        this.dataSource.filterPredicate = (data: Quiz, filter: string) => {
            const str = data.name + ' ' + data.description + ' ' + data.statut;
            return str.toLowerCase().includes(filter);
        };
        // établit les liens entre le data source et l'état de telle sorte que chaque fois que 
        // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
        this.state.bind(this.dataSource);
        // récupère les données 
        this.refresh();
    }
    refresh(){
        this.quizService.getAll().subscribe(quizzes => {
            this.dataSource.data = quizzes;
            this.state.restoreState(this.dataSource);
            this.filter = this.state.filter;
        })
    }
    filterChanged(e: KeyboardEvent) {
        const filterValue = (e.target as HTMLInputElement).value;
        // applique le filtre au datasource (et provoque l'utilisation du filterPredicate)
        this.dataSource.filter = filterValue.trim().toLowerCase();
        // sauve le nouveau filtre dans le state
        this.state.filter = this.dataSource.filter;
        // comme le filtre est modifié, les données aussi et on réinitialise la pagination
        // en se mettant sur la première page
        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }

    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
}
