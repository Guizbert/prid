namespace prid_2324_a12.Models;

public class SqlSolutionDTO{
    public string[] Error{get;set;} = new string[0];
    public string CorrectMessage{get;set;} = "";
    public string[] ColumnNames{get;set;} = new string[0];
    public string[][] Data{get;set;} = new string[0][];
    public string DbName{get; set;}="";
    public string[] solutions{get;set;} =new string[0];
    public bool isCorrect{get;set;}
    public DateTimeOffset? TimeStamp{get;set;}

    public SqlSolutionDTO CheckQueries(SqlSolutionDTO solutionQuery){
        //check col length et data lenght
        //Console.WriteLine("data : " + this.Data[1].Length +"\n solution data : "+solutionQuery.Data[1].Length);
        if(this.ColumnNames.Length != solutionQuery.ColumnNames.Length){
            this.Error = new string[]{ "Incorrect length for Columns"};
        }
        if(this.Data.Length != solutionQuery.Data.Length){
            this.Error = new string[]{ "Incorrect length for Rows"};
        }
             // mettre data et col dans un array a une dimension et check CHAQUE ELEMENTS DE CHAQUES ARRAY
        string[] userArray = this.ColumnNames.Concat(this.Data.SelectMany(row => row)).ToArray();
        string[] soluceArray = solutionQuery.ColumnNames.Concat(solutionQuery.Data.SelectMany(row => row)).ToArray();
        for(int i =0; i < userArray.Length; ++i){
            Console.WriteLine("data object ---> : " + userArray[i] +"\n solution data  ---> : "+soluceArray[i]);
            if(userArray[i] != soluceArray[i]){
                this.Error = new string[]{ "Incorrect data"};break; //s'arrête dès qu'on a une erreur
            }
        }
        if (this.Error.Length ==0){
            isCorrect = true;
            this.CorrectMessage = "Votre requête a retourné une réponse correcte ! \nNéanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance :)";
        }
        
        //return this car c'est ce qu'on veut return dans la page.
        return this; 
    }
}   