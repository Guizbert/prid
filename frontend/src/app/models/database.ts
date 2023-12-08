import 'reflect-metadata';
export class Database{
    id?: number;
    name?: string;
    description?: string;


    
    get display(): string {
       
        return `${this.name}`;
    }
  
}