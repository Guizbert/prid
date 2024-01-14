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
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Database } from 'src/app/models/database';
import { QuizService } from 'src/app/services/quiz.service';
import { MatRadioChange} from '@angular/material/radio';
import { Solution } from 'src/app/models/solution';
import { ConfirmDeleteComponent } from './ConfirmDelete.component';
import { Observable, of, switchMap } from 'rxjs';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

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
    @ViewChild("editor") editor!: CodeEditorComponent;


    public databases: Database[] = [];
    quiz?: Quiz | null;
    questions?: Question[] = [];
    database?: Database;
    isTest:boolean = false;
    editMode: boolean = false;
    isExistingQuiz: boolean =false;
    today: Date = new Date();
    questionsToDelete: Question[] = [];
    solution: Solution[] = [];
    haveAttempt: boolean = false;
    isUnique: boolean = false;
    newQuestionInProgress: boolean = false;
    constructor(
        public authService: AuthenticationService,
        private quizService: QuizService,
        private questionService: QuestionService,
        public dialog : MatDialog,
        public router: Router,
        private fb: FormBuilder,
        private activatedRoute: ActivatedRoute, 
    ){
        this.ctlName = this.fb.control('', {
            validators: [Validators.required, Validators.minLength(3)],
            asyncValidators: [this.checkQuizName()],
            updateOn: 'blur'
        });
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
                this.questions?.forEach(question => {
                    if (question.solutions) {
                        question.solutions = question.solutions.sort((a, b) => a.order! - b.order!);
                    }
                });
                // this.solutions = res!.questions;
                this.quizService.anyAttempt(this.quiz?.id!).subscribe(
                    res => {
                        this.haveAttempt = res;
                        if(this.haveAttempt){
                            this.quizEditionForm.disable();
                            this.editor.readOnly = true;
                        }
                    }
                )
                this.checkQuizName(); 
            });
            this.isExistingQuiz = true;
        }else {
            this.ctlTypeQuiz.setValue("Training");
            this.isExistingQuiz = false;
        }
        // pour check si y a un attempt etc
    }
    saveQuiz() {
        let id = this.activatedRoute.snapshot.params['id'];
    
        // Get adjusted dates
        const adjustedStartDate = this.getTimeZone(this.quizEditionForm.value.startDate, true);
        const adjustedFinishDate = this.getTimeZone(this.quizEditionForm.value.finishDate, false);
    
        console.log("avant");
        if (id > 0) { // if edit
            const editquiz: QuizEdit = {
                Id: id,
                DatabaseId: this.quizEditionForm.value.db.id,
                Name: this.quizEditionForm.value.name,
                Description: this.quizEditionForm.value.description,
                IsPublished: this.quizEditionForm.value.isPublished,
                IsTest: this.isTest,
                Start: adjustedStartDate,
                Finish: adjustedFinishDate,
                Questions: this.questions || [] // Ensure it's not null or undefined
            };
            console.log("editquiz Payload:", editquiz);
            this.quizService.updateQuiz(editquiz).subscribe(res => {
                console.log("apres 1 (edit): "+ res);
                this.router.navigate(['/quiz']);
            });
        } else { // if new quiz
            const savequiz: QuizSave = {
                DatabaseId: this.quizEditionForm.value.db.id,
                Name: this.quizEditionForm.value.name,
                Description: this.quizEditionForm.value.description,
                IsPublished: this.quizEditionForm.value.isPublished,
                IsTest: this.isTest,
                Start: adjustedStartDate,
                Finish: adjustedFinishDate,
                Questions: this.questions || [] // Ensure it's not null or undefined
            };
            console.log("Save Quiz Payload:", savequiz);
            this.quizService.postQuiz(savequiz).subscribe(
                res => {
                    console.log("apres  2 (save): "+ res);
                    this.router.navigate(['/quiz']);
                },
                error => {
                    console.error("Post Quiz Error:", error);
                }
            );
        }
    }
    getTimeZone(date1: Date | string, isStart: boolean): Date | undefined { // idée vient de Kenji
        console.log(date1);
        if (!date1) return undefined;
        
        let time1 = new Date(date1);
        let originalTime = new Date(date1); // Create a copy of the original date
        if(isStart){
            originalTime.setHours(0,0,0,111);
            time1.setMinutes(time1.getMinutes() - time1.getTimezoneOffset());
            time1.setHours(0,0,0,111);
        }else{
            originalTime.setHours(23,59,59,999);
            time1.setMinutes(time1.getMinutes() - time1.getTimezoneOffset());
            time1.setHours(23, 59, 59, 999);
        }
        // Check if the resulting time is different from the original time
        if (time1 == originalTime) {
            console.log(time1 + " <--- avant return ");
            return time1;
        } else {
            console.log(originalTime + " <--- avant return (unchanged)");
            return originalTime;
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
            const tempOrder = this.questions![qIndex].order;
            this.questions![qIndex].order = this.questions![qIndex - 1].order;
            this.questions![qIndex - 1].order = tempOrder;

            const temp = this.questions![qIndex];
            this.questions![qIndex] = this.questions![qIndex - 1];
            this.questions![qIndex - 1] = temp;

            console.log(this.questions![qIndex].order);
        }
    }

    // Move Question Down 
    OrderDown(qIndex: number): void {
        if (qIndex < this.questions!.length - 1) {
            const tempOrder = this.questions![qIndex].order;
            this.questions![qIndex].order = this.questions![qIndex + 1].order;
            this.questions![qIndex + 1].order = tempOrder;

            const temp = this.questions![qIndex];
            this.questions![qIndex] = this.questions![qIndex + 1];
            this.questions![qIndex + 1] = temp;
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

    checkQuizName(): (control: AbstractControl) => Observable<ValidationErrors | null> {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
          const id = this.activatedRoute.snapshot.params['id'];
          const name = control.value;
      
          if (!name) {
            // No need to perform the check if the name is empty
            return of(null);
          }
      
          return this.quizService.nameAvailable(name, id).pipe(
            switchMap((res: boolean) => {
              this.isUnique = res; // true = quiz exists
              console.log(res + ' <-------');
      
              if (!res) {
                console.log('not unique');
                return of({ isNotUnique: true });
              }
      
              console.log(this.isUnique);
              return of(null);
            })
          );
        };
      }

    canSave() {
        if (this.quizEditionForm.invalid) {
            console.log("Invalid form");
            return false;
        }
        if(this.ctlTypeQuiz.value == "Test"){
            if(!this.ctlStartDate.value || !this.ctlFinishDate.value)
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
        if (this.questions?.some(q => q.body!.length < 3)) {
            console.log("Some questions have less than 3 characters");
            return false;
        }
        if (this.questions?.some(q => {
            if (!q.solutions) {
                console.log("Solutions array is null for a question");
                return true;  // Set to true to indicate the failure
            }
            if (q.solutions.some(solution => solution?.sql!.length < 3)) {
                console.log("Some solutions have less than 3 characters");
                return true;  // Set to true to indicate the failure
            }
            return false;  // No issues found for this question
            })) {
            // If condition fails, return false
            return false;
        }
    
        console.log("All conditions passed");
        return true;
    }
    
}