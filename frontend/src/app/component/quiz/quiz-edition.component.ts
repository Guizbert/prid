import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy, Input, OnChanges,SimpleChanges } from '@angular/core';
import { Role, User } from "src/app/models/user";
import { Quiz, QuizEdit, QuizSave, Statut } from "src/app/models/quiz";
import * as _ from 'lodash-es';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { StateService } from 'src/app/services/state.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TruncatePipe } from 'src/app/helpers/truncatePipe ';
import { Question } from 'src/app/models/question';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Database } from 'src/app/models/database';
import { QuizService } from 'src/app/services/quiz.service';
import { MatRadioChange} from '@angular/material/radio';
import { Solution } from 'src/app/models/solution';
import { ConfirmDeleteComponent } from './ConfirmDelete.component';

@Component({
    //selector: 'quizTraining',
    templateUrl: 'quiz-edition.component.html',
    styleUrls: ['quiz-edition.component.css']
})
export class QuizEditionComponent implements OnInit{
  
    private user!: User | undefined ;
    isAdmin: boolean = false;

    public quizEditionForm!: FormGroup;
    public ctlName!:FormControl;
    public ctlDb! : FormControl;
    public ctlIsPublished!: FormControl;
    public ctlDescription!: FormControl;
    public ctlTypeQuiz!: FormControl;
    public ctlStartDate!:FormControl;
    public ctlFinishDate!:FormControl;


    public databases: Database[] = [];
    quiz?: Quiz | null;
    questions?: Question[] = [];
    database?: Database;
    //solutions?: Solution[] = [];
    isTest:boolean = false;
    editMode: boolean = false;
    isExistingQuiz: boolean =false;
    today: Date = new Date();
    questionsToDelete: Question[] = [];
    solution: Solution[] = [];
    haveAttempt: boolean = false;
    isUnique: boolean = false;
    newQuestionInProgress: boolean = false;

    //ajout question:


    constructor(
        public authService: AuthenticationService,
        private quizService: QuizService,
        private questionService: QuestionService,
        public dialog : MatDialog,
        public router: Router,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute, // Add ActivatedRoute for getting parameters from URL
    ){
        this.ctlName = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlDb = this.fb.control('', [Validators.required]);
        this.ctlIsPublished = this.fb.control(false);
        this.ctlDescription = this.fb.control('', [Validators.required]);
        this.ctlTypeQuiz = this.fb.control('', [Validators.required]);
        this.ctlStartDate = this.fb.control('');
        this.ctlFinishDate = this.fb.control('');
        this.quizEditionForm = this.fb.group({
            name: this.ctlName,
            db: this.ctlDb,
            isPublished: this.ctlIsPublished,
            description: this.ctlDescription,
            typeQuiz: this.ctlTypeQuiz,
            startDate: this.ctlStartDate,
            finishDate: this.ctlFinishDate,
        }, { validator: this.customValidator });
    }
    
    // Ajoutez la logique de validation personnalisée ici
    private customValidator(group: FormGroup): ValidationErrors | null {
        // Exemple de validation personnalisée

        //name
        const name = group.get('name')?.value;
        if(name.length < 3)
            return { 'badNameLength' : true};
        //db
        const db = group.get('db')?.value;
        if(db == null)
            return { 'noDb' : true};
        //date
        const startDate = group.get('startDate')?.value;
        const finishDate = group.get('finishDate')?.value;
        if (startDate && finishDate && startDate > finishDate) {
            return { 'dateMismatch': true };
        }
        return null;
    }

    updateType(e:MatRadioChange){
        const selectedValue = e.value;
        if(selectedValue == "Test")
            this.isTest = true;
        else 
            this.isTest = false;
    }
    ngOnInit(): void { 
        
        this.user = this.authService.currentUser;
        this.isAdmin = this.user?.role == Role.Teacher;
        let id = this.activatedRoute.snapshot.params['id'];
        this.quizService.getAllDb().subscribe(res => {
            this.databases = res;
        })
        if(id > 0 ){
            this.editMode = true;
            this.quizService.getQuiz(id).subscribe(res => {
                console.log(res);
                this.quiz = res;
                this.updateForm(res!);
                this.questions = res!.questions;
                // this.solutions = res!.questions;
                this.quizService.anyAttempt(this.quiz?.id!).subscribe(
                    res => {
                        this.haveAttempt = res;
                        console.log(res);
                    }
                )
                this.checkQuizName(); 
            });
            this.isExistingQuiz = true;
        }else {
            this.isExistingQuiz = false;
        }
        // pour check si y a un attempt etc
    }
    saveQuiz() {
        let id = this.activatedRoute.snapshot.params['id'];
        console.log(this.quizEditionForm);
        console.log(this.ctlDb.value);
        console.log(this.questions);
        console.log(this.quizEditionForm.value.startDate + " <-------- start");
        console.log(this.quizEditionForm.value.finishDate + "   < ----- finish");
        if(id > 0){ // if edit
            console.log("update Quiz <-<-<-<-<-<-");
            const editquiz: QuizEdit = {
                Id: id,
                DatabaseId: this.quizEditionForm.value.db.id,
                Name: this.quizEditionForm.value.name,
                Description: this.quizEditionForm.value.description,
                IsPublished: this.quizEditionForm.value.isPublished,
                IsTest: this.isTest,
                Start: this.quizEditionForm.value.startDate ? this.quizEditionForm.value.startDate.toISOString() : null,
                Finish: this.quizEditionForm.value.finishDate ? this.quizEditionForm.value.finishDate.toISOString() : null,
                Questions: this.questions || [] // Ensure it's not null or undefined
            };
            console.log("Save Quiz Payload:", editquiz);
            this.quizService.updateQuiz(editquiz).subscribe(res => {
                console.log(res);
                this.router.navigate(['/quiz']);
            });
        }else{ // if new quiz
            const savequiz: QuizSave = {
                DatabaseId: this.quizEditionForm.value.db.id,
                Name: this.quizEditionForm.value.name,
                Description: this.quizEditionForm.value.description,
                IsPublished: this.quizEditionForm.value.isPublished,
                IsTest: this.isTest,
                Start: this.quizEditionForm.value.startDate ? this.quizEditionForm.value.startDate : null,
                Finish: this.quizEditionForm.value.finishDate ? this.quizEditionForm.value.finishDate : null,
                Questions: this.questions || [] // Ensure it's not null or undefined
            };
            console.log("NEW QUIZ >-<-<-<-<-<->");
            console.log("Save Quiz Payload:", savequiz);
            this.quizService.postQuiz(savequiz).subscribe(
                res => {
                    console.log("Post Quiz Response:", res);
                    this.router.navigate(['/quiz']);
                },
                error => {
                    console.error("Post Quiz Error:", error);
                }
            );
        }
    }
    delete(){
        let id =this.activatedRoute.snapshot.params['id'];
        console.log("delete");
        if(id >0){
            const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
            width: '250px',
            data: { message: 'Do you really want to delete the quiz : '+ this.quiz?.name! + " ?" }
            });
        
            dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.quizService.deleteQuiz(id).subscribe(res => {
                    this.router.navigate(['/quiz']);
                    console.log("delete");
                });
            }
            });
        }        
      }
    updateForm(quiz:Quiz){
        const selectedDatabase = this.databases.find(db => db.id === quiz.database?.id);
        this.quizEditionForm.setValue({
            name: quiz.name,
            db: selectedDatabase,
            isPublished: quiz.isPublished,
            description: quiz.description,
            typeQuiz: quiz.isTest ? 'Test' : 'Training',
            startDate: quiz.start ? new Date(quiz.start) : null,
            finishDate: quiz.finish ? new Date(quiz.finish) : null,
        });
        this.isTest = quiz.isTest!;
        this.onDatabaseChange(quiz.database!);
    }
    
    // Move Question Up
    OrderUp(qIndex: number): void {
        if (qIndex > 0) {
            const temp = this.questions![qIndex];
            this.questions![qIndex] = this.questions![qIndex - 1];
            this.questions![qIndex - 1] = temp;
            //temp.order = qIndex+1 
        }
    }

    // Move Question Down 
    OrderDown(qIndex: number): void {
        if (qIndex < this.questions!.length - 1) {
            const temp = this.questions![qIndex];
            this.questions![qIndex] = this.questions![qIndex + 1];
            this.questions![qIndex + 1] = temp;
            //temp.order = qIndex-1 
        }
    }

    // Move Solution Up
    moveSolutionUp(qIndex: number, sIndex: number): void {
        if (sIndex > 0) {
            const temp = this.questions![qIndex].solutions![sIndex];
            this.questions![qIndex].solutions![sIndex] = this.questions![qIndex].solutions![sIndex - 1];
            this.questions![qIndex].solutions![sIndex - 1] = temp;
            // Update orders
            this.questions![qIndex].solutions![sIndex].order = sIndex + 1;
            this.questions![qIndex].solutions![sIndex - 1].order = sIndex;
        }
    }

    // Move Solution Down
    moveSolutionDown(qIndex: number, sIndex: number): void {
        if (sIndex < this.questions![qIndex].solutions!.length - 1) {
            const temp = this.questions![qIndex].solutions![sIndex];
            this.questions![qIndex].solutions![sIndex] = this.questions![qIndex].solutions![sIndex + 1];
            this.questions![qIndex].solutions![sIndex + 1] = temp;
            // Update orders
            this.questions![qIndex].solutions![sIndex].order = sIndex + 1;
            this.questions![qIndex].solutions![sIndex + 1].order = sIndex + 2;
        }
    }

    newQuestion() {
        const newQuestion: Question = {
            body: '',
            order: this.questions!.length + 1,
            solutions: []
        };
        this.questions!.push(newQuestion);
        this.newQuestionInProgress = true;
      }
      

      addSolution(questionIdx: number) {
        const newSolution: Solution = {
          order: this.questions![questionIdx].solutions!.length + 1 || 1, 
          sql: ''
        };
        this.questions![questionIdx].solutions!.push(newSolution);
      }
      

    deleteQuestion(index: number){
        this.questionsToDelete.push(this.questions![index]);
        // Retire la question du tableau principal
        this.questions!.splice(index, 1);
    }
    
    deleteSolution(questionIdx:number, solutionIdx:number){
        //this.solutionToDelete.push(this.questions![questionIdx].solutions![solutionIdx]);
        this.questions![questionIdx].solutions!.splice(solutionIdx, 1);
    }

    onDatabaseChange(database: Database): void {
        this.database = database;
    }
    checkQuestions(){
        if(this.questions?.length ==0)
            return true;
        return false;
    }
    checkSolutions(qIndex: number){
        const q = this.questions![qIndex];
        if(q.solutions?.length ==0)
            return true;
        return false;
    }

    checkQuizName(){
        let id = this.activatedRoute.snapshot.params['id'];
        console.log(id + " - " + this.quizEditionForm.value.name);
        this.quizService.nameAvailable(this.quizEditionForm.value.name, id).subscribe(res => {
            this.isUnique = res; // true = quiz existant
            console.log(res +" <-------");
        })
    }

    canSave() {
        if (this.quizEditionForm.invalid) {
            console.log("Invalid form");
            return false;
        }
        if (this.isUnique == false) {
            console.log("Not unique");
            return false;
        }
        if (this.checkQuestions()) {
            console.log("Some questions are missing solutions");
            return false;
        }
        if (this.database == null) {
            console.log("Database is null");
            return false;
        }
        if (this.haveAttempt) {
            console.log("There is an attempt");
            return false;
        }
        if (this.questions?.some(q => q.body!.length < 3 || q.solutions?.some(solution => solution.sql!.length < 3))) {
            console.log("Some questions or solutions have less than 3 characters");
            return false;
        }
    
        console.log("All conditions passed");
        return true;
    }
    
}