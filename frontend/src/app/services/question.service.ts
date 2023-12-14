import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, BehaviorSubject } from "rxjs";

import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer'; 

@Injectable({ providedIn: 'root' })
export class QuestionService{
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    private sqlSource = new BehaviorSubject<string>("");
    public sql$ = this.sqlSource.asObservable();

    getAll(): Observable<Question[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/question`).pipe(
            map(res => plainToInstance(Question, res))
        );
    }

    getForQuiz(id: number) {
        return this.http.get<Question>(`${this.baseUrl}api/question/getByQuiz/${id}`).pipe(
            map(res => plainToInstance(Question, res)),
            //catchError(err => of(null))
        );
    }

    getById(id: number) {
        return this.http.get<Question>(`${this.baseUrl}api/question/byId/${id}`).pipe(
            map(res => plainToInstance(Question, res)),
            //catchError(err => of(null))
        );
    }

    getOtherQuestionByQuestion(id:number){
        return this.http.get<Question[]>(`${this.baseUrl}api/question/getOther/${id}`).pipe(
            map(res => plainToInstance(Question, res)),
            //catchError(err => of(null))
        );
    }

    getQuestionsId(id: number): Observable<number[]> {
        return this.http.get<number[]>(`${this.baseUrl}api/question/getQuestionss/${id}`);
    }
    
    querySent(query: string, dbname: string): Observable<any> {
        //console.log(options);
        return this.http.get<any>(`${this.baseUrl}api/question/querySent/${query}/${dbname}`);
    }

    getColumns(dbname:string):Observable<any[]>{
        return this.http.get<any>(`${this.baseUrl}api/question/GetAllColumnNames/${dbname}`); 
    }
    
  
  
}