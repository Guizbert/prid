import { Type } from "class-transformer";
import 'reflect-metadata';

export enum Statut{
    CLOTURE ="CLOTURE",
    OUVERT="OUVERT",
    EN_COURS="EN COURS",
    PAS_COMMENCE= "PAS COMMENCE"
}
export class Quiz{
    name?: string;
    description?: string;
    isPublished?: boolean;
    isClosed?: boolean;
    isTest?: boolean;
    start?: Date;
    finish?: Date;
    database?: string;
    statut?: Statut = Statut.PAS_COMMENCE; //recherche en db si current user a fait un attempt
    action?: string;
    
    get display(): string {
        console.log(this.statut);
        return `${this.name} ${this.database} ${this.getstatut}  ${this.action}`;
    }
    
    get getstatut(): string {
        const currentDate = new Date();

        if (this.start && this.finish) {
            if (currentDate >= this.start && currentDate <= this.finish) {
                return "EN_COURS";
            } else if (currentDate > this.finish) {
                return "CLOTURE";
            } else {
                return "PAS_COMMENCE";
            }
        } else {
            return "PAS_COMMENCE";
        }
    }

    // get evaluation(): number{
        
    // }
}