import { Component, AfterViewInit, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Role, User } from 'src/app/models/user';
import { StateService } from 'src/app/services/state.service';
import { Subscription, connect } from 'rxjs';
// import { MatDialog, MatSnackBar } from '@angular/material';
import { Quiz } from 'src/app/models/quiz';
import { Question } from 'src/app/models/question';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { AuthenticationService } from '../../services/authentication.service';
import { Database } from 'src/app/models/database';
import { Injectable } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";
import { Attempt } from 'src/app/models/Attempt';
import { Answer } from 'src/app/models/Answer';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import {MatIconModule} from '@angular/material/icon'; 

@Component({
    templateUrl: 'exam1.component.html',
})
export class Exam1 implements OnInit, AfterViewInit{
    connectedUser!: User | undefined;

    listStudent! : User[] | null;
    listQuiz?: Quiz[] | null;
    listAttempt?: Attempt[] | null;
    listAnswer?: Answer[] | null; // on pourra mettre un delete button ou un edit

    selectedStudent?: User | null;
    selectedQuiz?: Quiz | null;


    constructor(
        public authService: AuthenticationService,
        private userService: UserService,
        private questionService: QuestionService,
        private QuizService: QuizService,
        public router: Router,
    ){

    }

    

    ngOnInit(): void {
        this.connectedUser = this.authService.currentUser;
        if(this.connectedUser?.role != Role.Teacher){
            this.router.navigate(['/quiz']);
        }
    }

    ngAfterViewInit(): void {
        this.userService.getStudent().subscribe(res => {
            this.listStudent= res;
        })       
    }

    onStudentChange(user: User){
        this.selectedStudent = user;
        console.log(" - new student chosen : " + this.selectedStudent.pseudo);
        //fais l'appelle pour récup les quiz 
        this.QuizService.getAll(this.connectedUser!.id).subscribe(res =>{
            this.listQuiz = res;
        })
    }
    onQuizChange(quiz: Quiz){
        this.selectedQuiz = quiz;
        console.log(" - new student chosen : " + this.selectedQuiz.name);
        // faire appelle pour check si attempt du user : 
        this.questionService.getAnswersFromUser(quiz.id!, this.selectedStudent?.id!).subscribe(res=>{
            this.listAttempt = res;
            this.updateAnswer(this.listAttempt);
        });
    }
    updateAnswer(attmpts: Attempt[]){
        attmpts.forEach(a => {
            console.log(a);
            this.listAnswer = a.answers;
        })
    }
    delete(){

    }
}