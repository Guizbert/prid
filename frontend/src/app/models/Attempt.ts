import { Type } from "class-transformer";
import 'reflect-metadata';
import { Quiz } from "./quiz";
import { Solution } from "./solution";
import { Database } from "./database";
import { Answer } from "./Answer";


export class Attempt{
    id?: number;
    //quiz?: Quiz;
    Start?: Date;
    Finish?: Date;
    userId?:number;
    quizId?: number;
    answer?: Answer[];

    get display(): string {
        return `${this.id}`;
    }

    // get evaluation(): number{
        
    // }
}