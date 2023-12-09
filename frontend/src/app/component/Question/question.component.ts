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
  user?: User ;

  @ViewChild("editor") editor!: CodeEditorComponent;

  query = "SELECT *\nFROM P\nWHERE COLOR='Red'";

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

  }


  ngOnInit(): void {
    const questionId = this.activatedRoute.snapshot.params['id'];
    this.questionService.getById(questionId).subscribe(res => {
      this.question = res;
      this.quizid = this.question.quizId!;
      console.log(this.quizid);
      this.loadOtherQuestion(this.question.quizId!);
    });
  }

  prevQuestion() {
    if (this.question.id != undefined && this.question.id >=1 ) {
      if (!this.query) {
        // Afficher un message si la chaîne de requête est vide
        
      }
      var prev = this.question.id - 1;
      if (this.otherQuestions != null && this.otherQuestions.includes(prev)) {
        this.router.navigate(['/question/' + prev]);
        this.refresh(prev);
      }
    }
    console.log("prev             <-");
    console.log(this.question);
  }
  
  nextQuestion() {
    if (this.question.id != undefined) {
      var next = this.question.id + 1;
      if (this.otherQuestions != null && this.otherQuestions.includes(next)) {
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
  envoyer() {
    // Implement the refresh logic as needed
    console.log("send             <-");
  }

  delete(){
    this.query = "";
  }

  voirSoluce(){
    console.log("voir soluce      <-");
    if(this.solutions.length>0) this.solutions = [];
    this.showSoluce = true;
    if(this.question){
      for(let i = 0; i < this.question.solutions!.length; ++i){
        this.solutions.push(this.question.solutions![i].sql!);
      }
      console.log(this.solutions);
    }

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

  refresh(id:number){
    if(this.solutions.length>0) this.solutions = [];
    this.questionService.getById(id).subscribe(res => {
      this.question = res;
      this.delete();
      console.log(this.question);
    });
  }

  focus() {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
