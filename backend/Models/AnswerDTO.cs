namespace prid_2324_a12.Models;

public class AnswerDTO{
    public int Id {get; set;}
    public string Sql {get; set;} = null!;
    public DateTimeOffset? TimeStamp {get; set;}
    public bool IsCorrect {get; set;}
    public int AttemptId{get;set;}
    public int QuestionId{get;set;}

    //public virtual ICollection<AttemptDTO> Attempts {get;set;}= new HashSet<AttemptDTO>();

}