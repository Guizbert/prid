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


@Component({
  templateUrl: 'question.component.html',
  styleUrls: ['question.component.css']

})
export class QuestionComponent implements OnInit, OnDestroy  {
  question!: Question;
  quizid!: number;
  otherQuestions: number[] = [];
  solutions: string[] = [];
  sql?:string = "";
  quiz!: Quiz;
  subscription: Subscription;
  showSoluce: boolean = false;
  database!: Database;
  isTest: boolean = false;
  //data a montrer
  dataTable: string[] = []; //data
  columnTable: string[] = []; //colonne
  dataT: string[] =[];        //les deux réunis

  resultQuery: string[]=[]; // pour vérfier si tout est bon a partir de la première solution
  resultColumn:string[]=[];
  resultData:string[]=[];

  badQuery: boolean =false;
  correctQuery: boolean =false;
  errors: string[] = [];
  correctMessage: string = "";
  user?: User ;
  attempt?: Attempt;

  @ViewChild("editor") editor!: CodeEditorComponent;

  query = "";

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private router: Router,
    public authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute, // Add ActivatedRoute for getting parameters from URL
  ) {
    this.user = this.authenticationService.currentUser;
    this.subscription = questionService.sql$.subscribe(sql1 => {
      this.sql = sql1;
    })
    this.resultQuery = []; this.dataT = [];

  }


  ngOnInit(): void {
    //console.log(this.quizService.attemptId); // pour check si y a un attempt mais fonctionne pas.
    const questionId = this.activatedRoute.snapshot.params['id'];
    this.questionService.getById(questionId).subscribe(res => {
      this.question = res;
      console.log(this.question);
      this.quizid = this.question.quizId!; 
      this.quizService.getAttempt(this.quizid, this.user!.id).subscribe(res => {
          if(res) this.attempt = res;
          
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
    });
    
    // this.questionService.getColumns(this.database.name!).subscribe(res =>{
    //   this.editor.getColumsName(res);
    // })
    //this.editor.

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
    console.log("exit             <-");
    this.router.navigate(['/quiz']);
  }
  delete(){
    this.query = "";
  }

 
 envoyer() {
    // Implement the refresh logic as needed
    console.log("send             <-");
    //doit faire la création si elle n'existe pas; et la modification si elle existe déjà 

    const cleanedQuery = this.query.replace(/[\r\n]/g, ' '); // enlève le \n pour éviter les erreurs 
    if(cleanedQuery){
      this.questionService.querySent(this.question.id!, cleanedQuery, this.database.name!).subscribe(
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
    if(this.solutions.length>0) this.solutions = [];
    this.questionService.getById(id).subscribe(res => {
      this.question = res;
      this.delete();
      this.columnTable = [];
      this.dataTable= [];
      this.errors = [];
      this.badQuery = false;
      this.correctQuery = false;
      console.log(this.question);
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
