import { Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import { QuestionService } from 'src/app/services/question.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
// import { MatDialog, MatSnackBar } from '@angular/material';
import { Quiz } from 'src/app/models/quiz';
import { Question } from 'src/app/models/question';
import { CodeEditorComponent } from '../code-editor/code-editor.component';



@Component({
  templateUrl: 'question.component.html',
  styleUrls: ['question.component.css']

})
export class QuestionComponent implements OnInit {
  question!: Question;
  quizid!: number;
  otherQuestions: number[] = [];
  sql?:string = "";
  quiz!: Quiz;
  @ViewChild("editor") editor!: CodeEditorComponent;

  query = "SELECT *\nFROM P\nWHERE COLOR='Red'";

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private activatedRoute: ActivatedRoute // Add ActivatedRoute for getting parameters from URL
  ) {}


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
    console.log("prev             <-");
    console.log(this.question?.quizId);

  }
  nextQuestion() {
    console.log("next             <-");
    console.log(this.otherQuestions);

  }

  exit(){
    console.log("exit             <-");
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

  }

  loadOtherQuestion(quizId: number){
    this.questionService.getQuestionsId(quizId).subscribe(
      (questionIds: number[]) => {
        // Store the question IDs in memory
        this.otherQuestions = questionIds;
        console.log(" questions id -> "+this.otherQuestions);
      }
    );
  }

  refresh(id:number){
    this.questionService.getById(id).subscribe(res => {
      this.question = res;
      console.log(this.question);
    });
  }

  focus() {
    throw new Error('Method not implemented.');
  }
}
