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
        //check col length et data length
        List<string> errors = new();

        if(this.Error.Length != 0){
            return this;
        }
        
        if(this.Data.Length != solutionQuery.Data.Length){
            errors.Add("Incorrect length for rows");
        }
        if(this.ColumnNames.Length != solutionQuery.ColumnNames.Length){
            errors.Add("Incorrect length for Columns");
            //this.Error = new string[]{ "Incorrect length for Columns"};
        }
        else{ 
            /* ====> autre solution 
             string[] userArray = this.Data.SelectMany(row => row).ToArray();
                string[] solutionArray = solutionQuery.Data.SelectMany(row => row).ToArray();
                userArray = userArray.OrderBy(s => s).ToArray();
                        soluceArray = soluceArray.OrderBy(s => s).ToArray();

                if (!userArray.SequenceEqual(solutionArray))
                {
                    errors.Add("Incorrect data");
                }
                
                */
            Dictionary<string, string> columnNameMap = solutionQuery.ColumnNames
                .Select((name, index) => new { OriginalName = this.ColumnNames[index], NewName = name })
                .ToDictionary(mapping => mapping.OriginalName, mapping => mapping.NewName);

            for (int i = 0; i < this.ColumnNames.Length; ++i)
            {
                this.ColumnNames[i] = columnNameMap[this.ColumnNames[i]];
            }
        }
        // mettre data et col dans un array a une dimension et check CHAQUE ELEMENTS DE CHAQUES ARRAY
        string[] userArray = this.ColumnNames.Concat(this.Data.SelectMany(row => row)).ToArray();
        string[] soluceArray = solutionQuery.ColumnNames.Concat(solutionQuery.Data.SelectMany(row => row)).ToArray();
        userArray = userArray.OrderBy(s => s).ToArray();
        soluceArray = soluceArray.OrderBy(s => s).ToArray();

        for(int i =0; i < userArray.Length; ++i){
            if(userArray[i] != soluceArray[i]){
                errors.Add("Incorrect data"); break;
            }
        }
        if (errors.Count ==0){
            isCorrect = true;
            this.CorrectMessage = "Votre requête a retourné une réponse correcte ! \nNéanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance :)";
        }else{
            this.Error = errors.ToArray();
        }
        //return this car c'est ce qu'on veut return dans la page.
        return this; 
    }
}   