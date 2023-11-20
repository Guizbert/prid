namespace prid_2324_a12.Models;

public class AnswerDTO{
    public int Id {get; set;}
    public string Sql {get; set;} = null!;
    public DateTimeOffset? TimeStamp {get; set;}
    public bool IsCorrect {get; set;}
}