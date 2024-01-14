import { Type } from "class-transformer";
import 'reflect-metadata';


export enum Role {
    Student = 0,
    Teacher = 1
}

export class User {
    id!: number;
    pseudo?: string;
    email?: string;
    password?: string;
    lastName?: string;
    firstName?: string;
    @Type(() => Date)
    birthDate?: Date;
    role: Role = Role.Student;
    token?: string;
    refreshToken?: string;

    public get roleAsString(): string {
        return Role[this.role];
    }
    get display(): string {
        return `${this.pseudo} (${this.getrole})`;
    } 

    get getrole(): string{
        switch(this.role){
            case Role.Student:
                return "Student";
            case Role.Teacher:
                return "Teacher";
            default:
                return "Student";
        }
    }
    get age(): number | undefined {
        if (!this.birthDate)
            return undefined;
        var today = new Date();
        var age = today.getFullYear() - this.birthDate.getFullYear();
        today.setFullYear(today.getFullYear() - age);
        if (this.birthDate > today) age--;
        return age;
    }
}

export class UserSave{
    pseudo?:string;
    email?: string;
    firstName?: string;
    lastName?: string;
    Birthdate?: Date;
    password?: string;
   
}