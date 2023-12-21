import { Component, AfterViewInit, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { StateService } from 'src/app/services/state.service';
import { Subscription } from 'rxjs';
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
import { ExitDialogComponent } from './ExitDialogComponent';



@Component({
  templateUrl: 'question.component.html',
  styleUrls: ['question.component.css']

})
export class QuestionComponent implements OnInit, AfterViewInit  {
  question!: Question;
  answer?: Answer;
  quizid!: number;
  otherQuestions: number[] = [];
  solutions: string[] = [];
  quiz!: Quiz;
  showSoluce: boolean = false;
  database!: Database;
  isTest: boolean = false;
  //data a montrer
  dataTable: string[] = []; //data
  columnTable: string[] = []; //colonne
  dataT: string[] =[];        //les deux réunis

  badQuery: boolean =false;
  correctQuery: boolean =false;
  errors: string[] = [];
  correctMessage: string = "";
  user?: User ;
  attempt?: Attempt;

  isreadonly:boolean = false;

  @ViewChild("editor") editor!: CodeEditorComponent;

  query = "";

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private router: Router,
    public authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute, // Add ActivatedRoute for getting parameters from URL
    private dialog : MatDialog
  ) {
    this.user = this.authenticationService.currentUser;
    this.dataT = [];

  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.refresh(this.activatedRoute.snapshot.params['id']);
  }

  prevQuestion() {
    if (this.question.id != undefined && this.question.id >= 1) {
      if (!this.query) {
        // Afficher un message si la chaîne de requête est vide
      }
      console.log(this.otherQuestions.indexOf(this.question.id));
      var index =this.otherQuestions.indexOf(this.question.id);
      let prev = this.otherQuestions[index-1];
      if (prev >= 0 && this.otherQuestions[prev] !== null) {
        this.router.navigate(['/question/' + prev]);
        this.refresh(prev);
      }
    }
    console.log("prev             <-");
    console.log(this.question);
  }
  
  nextQuestion() {
    if (this.question.id != undefined) {
      var index =this.otherQuestions.indexOf(this.question.id);
      let next = this.otherQuestions[index+1];
      console.log(this.otherQuestions.length);
      if (this.otherQuestions[next] !== null && this.otherQuestions.includes(next)) {
        this.router.navigate(['/question/' + next]);
        this.refresh(next);
      }
    }
    console.log("next             <-");
    console.log(this.otherQuestions);
  } 

  exit(){
    console.log("exit <-");
    if(this.isreadonly){
      this.router.navigate(['/quiz']);
    }
    else{
      const dialogRef = this.dialog.open(ExitDialogComponent, {
      width: '250px',
      data: { message: 'If you exit, the attempt will be finished.' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.questionService.endAttempt(this.attempt!.id!).subscribe(res => {
          console.log(res);
        })
        // User clicked on "Yes", navigate away
        this.router.navigate(['/quiz']);
      }
      // User clicked on "No" or closed the dialog
    });
    }
    
  }

  delete(){
    this.query = "";
  }

 
 envoyer(newAnswer: boolean) {
    // Implement the refresh logic as needed
    console.log("send             <-");
    //doit faire la création si elle n'existe pas; et la modification si elle existe déjà 

    const cleanedQuery = this.query.replace(/[\r\n]/g, ' '); // enlève le \n pour éviter les erreurs 
    if(cleanedQuery){
      this.questionService.querySent(this.question.id!, cleanedQuery, this.database.name!, newAnswer, this.attempt?.id!).subscribe(
        (data: any) => {
          this.errors = data.error; 
          if(this.errors.length >0)
            this.badQuery = true;
          this.correctMessage = data.correctMessage;
          if(this.correctMessage)
            this.correctQuery = true;

          this.dataT = data;                //toutes les data
          this.dataTable =  data.data;      //que le contenu
          this.columnTable = data.columnNames;  // que les colonnes

          if(newAnswer){
            console.log("new");
          }
          /** ============================================ */
          //faire la création de l'attempt et answer
        }
      );
    }
    
  }
  

  voirSoluce(){
    console.log("voir soluce      <-");
    if(this.solutions.length>0) this.solutions = [];
    this.showSoluce = true;
    if(this.question){
      for(let i = 0; i < this.question.solutions!.length; ++i){
        this.solutions.push(this.question.solutions![i].sql!);
      }
    }

  }




  refresh(id:number){
    this.query = "";
    this.dataT = [];
    this.dataTable = [];
    this.columnTable = [];
    if(this.solutions.length>0) this.solutions = [];
    this.questionService.getById(id).subscribe(res => {
      this.question = res;
      this.quizid = this.question.quizId!; 
      this.quizService.getAttempt(this.quizid, this.user!.id, id).subscribe(res => {
          if(res){
            this.attempt = res;
            console.log(res);
            if(res.finish){
              this.editor.readOnly = true;
              this.isreadonly = true;
              console.log(this.editor.readOnly + " IS READ ONLY ");
            }
            this.answer = res.answers[0];
            if(this.answer){
              this.query = this.answer?.sql!;
              this.envoyer(false);
            }
          }
      });
      this.database! = this.question.database!;
      this.quizService.isTestByid(this.question.quizId!).subscribe(res =>{
        console.log(res);
        this.isTest = res;
      })
      for(let i = 0; i < this.question.solutions!.length; ++i){
        this.solutions.push(this.question.solutions![i].sql!);
      }
      this.loadOtherQuestion(this.question.quizId!);
      this.badQuery = false;
      this.correctQuery = false;
      this.showSoluce = false;
    });
  }


  loadOtherQuestion(quizId: number){
    this.questionService.getQuestionsId(quizId).subscribe(
      (questionIds: number[]) => {
        // Get the question IDs
        this.otherQuestions = questionIds;
        console.log(" other question id -> "+this.otherQuestions);
      }
    );
  }

  focus() {
    throw new Error('Method not implemented.');
  }


}
