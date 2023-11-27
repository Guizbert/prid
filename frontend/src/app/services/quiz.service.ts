import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quiz } from '../models/quiz';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer'; 

@Injectable({ providedIn: 'root' })
export class QuizService{
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    getAll(): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }

    getTest(): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz/test`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }
    getQuizzes(): Observable<Quiz[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/quiz/quizzes`).pipe(
            map(res => plainToInstance(Quiz, res))
        );
    }
    getQuiz(id: number){
        return this.http.get<Quiz>(`${this.baseUrl}api/quiz/${id}`).pipe(
            map(q => plainToInstance(Quiz,q)),
            catchError(err => of(null))
        )
    }
}