import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer'; 
import { Attempt } from '../models/Attempt';

@Injectable({ providedIn: 'root' })
export class QuizService{
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    private _attemptId?: number;

    set attemptId(value: number) {
        this._attemptId = value;
    }

    get attemptId(): number {
        return this._attemptId!;
    }
    getAll(): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }

    getTest(userId: number): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz/test/${userId}`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }
    getQuizzes(userId: number): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz/quizzes/${userId}`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }
    getQuiz(id: number){
        return this.http.get<Quiz>(`${this.baseUrl}api/quiz/${id}`).pipe(
            map(q => plainToInstance(Quiz,q)),
            catchError(err => of(null))
        )
    }
    getQuestions(id: number) {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz/getQuestions/${id}`).pipe(
            map(qu => plainToInstance(Question, qu)),
            catchError(err => of(null))
        );
    }

    isTestByid(id:number){
        return this.http.get<any>(`${this.baseUrl}api/quiz/isTestByid/${id}`);
    }
    haveAttempt(quizId: number, userId:number){
        return this.http.get<any>(`${this.baseUrl}api/quiz/haveAttempt/${quizId}/${userId}`);
    }
    getAttempt(quizId: number, userId:number, questionId:number){
        return this.http.get<any>(`${this.baseUrl}api/quiz/getAttempt/${quizId}/${userId}/${questionId}`); //return attempt et answer de la question
    }
    getNote(quizId: number, userId:number){
        return this.http.get<any>(`${this.baseUrl}api/quiz/getNote/${quizId}/${userId}`);
    }
    newAttempt(quizId: number, userId: number): Observable<Attempt> {
        return this.http.post<Attempt>(`${this.baseUrl}api/quiz/newAttempt/${quizId}/${userId}`, {});
    }

   
      
}