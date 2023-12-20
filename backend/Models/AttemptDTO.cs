namespace prid_2324_a12.Models;

public class AttemptDTO
{

    public int Id {get; set;}
    public DateTimeOffset? Start { get; set;}
    public DateTimeOffset? Finish {get; set;}
    public int QuizId{get;set;}
    public int UserId{get;set;}
    public virtual ICollection<AnswerDTO> Answers {get;set;} = new List<AnswerDTO>();

}