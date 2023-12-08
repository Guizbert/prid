import { Type } from "class-transformer";
import 'reflect-metadata';
import { Quiz } from "./quiz";


export class Question{
    id?: number;
    //quiz?: Quiz;
    order?: number;
    body?: string;
    quizId?: number;
    quizName?: string;
    quizIsTest?: boolean;
    quizdbName?: string;
    
    get display(): string {
       
        return `${this.quizName} ${this.order}  `;
    }

    get displayBody():string{
        return `${this.body}`;

    }
    

    // get evaluation(): number{
        
    // }
}