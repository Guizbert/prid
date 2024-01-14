import { Type } from "class-transformer";
import 'reflect-metadata';
import { Quiz } from "./quiz";
import { Solution } from "./solution";
import { Database } from "./database";


export class Question{
    id?: number;
    order?: number;
    body?: string;
    quizId?: number;
    quizName?: string;
    database?: Database;
    solutions?: Solution[];
    quizIsTest?: boolean;
    openedPanel?:boolean= false;
}