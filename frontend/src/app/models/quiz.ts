import { Type } from "class-transformer";
import 'reflect-metadata';
import { Question } from "./question";
import { Database } from "./database";

export enum Statut{
    PAS_COMMENCE= 0,
    OUVERT=1,
    EN_COURS=2,
    CLOTURE =3,
    FINI= 4,
    PUBLIE = 5,
    PAS_PUBLIE=6,
}
export class Quiz{
    id?: number;
    name?: string;
    description?: string;
    isPublished?: boolean;
    isClosed?: boolean;
    isTest?: boolean;
    haveAttempt?: boolean;
    canInteract?: boolean;
    start?: Date;
    finish?: Date;
    database?: Database;
    statut?: Statut;
    action?: string;
    note?:number;

    questions?: Question[];
    
    get display(): string {
        
        return `${this.name} ${this.database} ${this.getstatut}  ${this.action} ${this.note}`;
    }


    
    public get getstatut(): string {
        switch (this.statut) {
            case Statut.PAS_COMMENCE:
                return "PAS_COMMENCE";
            case Statut.OUVERT:
                return "OUVERT";
            case Statut.EN_COURS:
                return "EN_COURS";
            case Statut.CLOTURE:
                return "CLOTURE";
            case Statut.FINI:
                return "FINI";
            case Statut.PUBLIE:
                return "PUBLIE";
            case Statut.PAS_PUBLIE:
                    return "PAS_PUBLIE";
            default:
                return "PAS_COMMENCE";
        }
    }

    public get getNote() : string{
        if(this.note){
            return this.note+"/10";
        }
        return "N/A";
    }
}

export class QuizSave{
    DatabaseId?: number;
    Name?: string;
    Description?: string;
    IsPublished?: boolean;
    IsTest?: boolean;
    Start?: Date;
    Finish?: Date;
    Questions?: Question[];
   
}

export class QuizEdit{
    DatabaseId?: number;
    Name?: string;
    Description?: string;
    IsPublished?: boolean;
    IsTest?: boolean;
    Start?: Date;
    Finish?: Date;
    Questions?: Question[];
}