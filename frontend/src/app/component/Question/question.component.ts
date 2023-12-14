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
  //isTest!: boolean = false;
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
  user?: User ;

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
    const questionId = this.activatedRoute.snapshot.params['id'];
    this.questionService.getById(questionId).subscribe(res => {
      this.question = res;
      console.log(this.question);
      this.quizid = this.question.quizId!;
      this.database! = this.question.database!;
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

    const cleanedQuery = this.query.replace(/[\r\n]/g, ' '); // enlève le \n pour éviter les erreurs 
    if(cleanedQuery){
      this.questionService.querySent(cleanedQuery, this.database.name!).subscribe(
        (data: any) => {
          this.dataT = data;                //toutes les data
          this.dataTable =  data.data;      //que le contenu
          this.columnTable = data.columns;  // que les colonnes
          this.result();

          /** ============================================ */
          //faire la création de l'attempt et answer
        }
      );
    }
    
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
      this.columnTable = [];
      this.dataTable= [];
      this.errors = [];
      this.correctQuery = false;
      console.log(this.question);
      this.showSoluce = false;
    });
  }

  result(){   //check si la query est correct ou non
    this.errors = [];           // au cas où on a déjà des errors ;
    if(this.solutions.length>0){
      console.log((this.solutions[0]) + " <- Solucionne");
      let cleanedQuery = this.solutions[0].replace(/[\r\n]/g, ' ');
      console.log("cleaned query : \n" + cleanedQuery + "\n\n database name :\n"+this.database.name);
      this.questionService.querySent(cleanedQuery,this.database.name!).subscribe(
        (res: any) => {
            console.log(res);
          // Assume that the data received is a two-dimensional array of strings
          this.resultQuery = res;
          this.resultData =  res.data;        
          this.resultColumn = res.columns;
          console.log(this.resultQuery);
          // Utilisez les données reçues comme nécessaire dans votre composant

          console.log(this.checkDataLength(this.resultColumn, this.columnTable) + " <--- CHECK COL LENGTH");
          if(!this.checkColLength(this.resultColumn, this.columnTable) || !this.checkDataLength(this.resultColumn, this.columnTable)){
            this.errors.push("bad numbers of columns or rows");
            this.badQuery=true;
            this.correctQuery = false;
          }
          else{
            this.checkQuery(this.resultQuery, this.dataT);
            if(this.errors.length == 0){
              this.correctQuery = true;
              this.badQuery=false;
            }
          }
        });
    }
  }

  checkColLength(soluce: any, userQuery: any): boolean{
    if(soluce.length == 0  || userQuery.length == 0){
      return false;
    }    
    return soluce.length == userQuery.length;
  }
  checkDataLength(soluce: any, userQuery: any){
    if(soluce.length == 0  || userQuery.length == 0){
      return false;
    }
    return soluce.length == userQuery.length;
  }

  checkQuery(soluce: any, userQuery: any) {
    const sort = (table: any) => table.data.flat().map(String).sort(); // Vlad m'a aidé pour ça 
    const solucesorted = sort(soluce);
    const userSorted = sort(userQuery);
    for (let i =0 ; i < solucesorted.length; ++i){
      if(solucesorted[i] !== userSorted[i]){
        this.errors.push("wrong data"); break;
      }
    }
  }


  focus() {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
