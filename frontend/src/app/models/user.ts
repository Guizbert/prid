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
        return `${this.pseudo} (${this.birthDate ? this.age + ' years old' : 'age unknown'})`;
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