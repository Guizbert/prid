import { Type } from "class-transformer";
import 'reflect-metadata';
import { Quiz } from "./quiz";
import { Solution } from "./solution";


export class Question{
    id?: number;
    //quiz?: Quiz;
    order?: number;
    body?: string;
    quizId?: number;
    quizName?: string;
    quizIsTest?: boolean;
    quizdbName?: string;
    solutions?: Solution[];
    
    get display(): string {
       
        return `${this.quizName} ${this.order}  `;
    }

    get displayBody():string{
        return `${this.body}`;

    }
    

    // get evaluation(): number{
        
    // }
}