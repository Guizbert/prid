import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, BehaviorSubject } from "rxjs";

import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer'; 
import { Attempt } from '../models/Attempt';

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

    getFirstQuestion(id: number, userId:number) {
        return this.http.get<Question>(`${this.baseUrl}api/question/getFirstQuestion/${id}/${userId}`).pipe(
            map(res => plainToInstance(Question, res)),
            //catchError(err => of(null))
        );
    }
    getFirstQuestionReadOnly(id: number, userId:number) {
        return this.http.get<Question>(`${this.baseUrl}api/question/getFirstQuestionReadOnly/${id}/${userId}`).pipe(
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
    
    querySent(questionId:number,query: string, dbname: string, newAnswer:boolean,attemptId:number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}api/question/querySent`, {questionId,query, dbName:dbname, newAnswer,attemptId});
    }

    endAttempt(attemptId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}api/question/endAttempt/${attemptId}`);
    }

    getColumns(dbname:string):Observable<any[]>{
        return this.http.get<any[]>(`${this.baseUrl}api/question/GetAllColumnNames/${dbname}`); 
    }
    getData(dbname:string):Observable<any[]>{
        return this.http.get<any[]>(`${this.baseUrl}api/question/getdata/${dbname}`); 
    }

    checkName(name:string){
        return this.http.get<any[]>(`${this.baseUrl}api/question/NameAvailable/${name}`); 
    }

  
}