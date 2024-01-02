namespace prid_2324_a12.Models;

public class QuestionDTO{
    public int Id{get;set;}
    public int Order{get;set;}
    public string Body{get;set;}= null!;
    
    public int QuizId{get;set;}
    public string QuizName{get;set;} = null!;
    public Database Database {get;set;} = null!;

    public virtual ICollection<AnswerDTO> Answers {get;set;} = new List<AnswerDTO>();
    public virtual ICollection<SolutionDTO> Solutions {get;set;} = new HashSet<SolutionDTO>();

}

public class QuestionSaveDTO{
    public int Id{get;set;}
    public int Order{get;set;}
    public string Body{get;set;}= null!;
    public int QuizId{get;set;}
    
    public virtual ICollection<SolutionDTO> Solutions {get;set;} = new HashSet<SolutionDTO>();
}