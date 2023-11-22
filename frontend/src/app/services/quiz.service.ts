import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Quiz } from '../models/quiz';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
}