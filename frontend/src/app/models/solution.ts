import { Type } from "class-transformer";
import 'reflect-metadata';
import { Question } from "./question";
import { Database } from "./database";

export class Solution{
    id?:number;
    order?:number;
    sql?:string;


    get display(): string {
        return `${this.sql}`;
    }
}