import { Type } from "class-transformer";
import 'reflect-metadata';
import { Quiz } from "./quiz";
import { Solution } from "./solution";
import { Database } from "./database";


export class Answer{
    id?: number;
    //quiz?: Quiz;
    Sql?: string;
    timeStamp?: Date;
    isCorrect?:boolean;
    quizId?: number;
    answer?: Answer[];
    attemptId?:number;
    questionId?:number;

    get display(): string {
        return `${this.Sql} ${this.timeStamp}`;
    }

    // get evaluation(): number{
        
    // }
}