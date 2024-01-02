namespace prid_2324_a12.Models;

public class QuizDTO{
    public int Id {get;set;}
    public Database Database{get;set;}= null!;
    public int DatabaseId{get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsClosed {get;set;}    
    public bool IsTest {get; set;}
    public bool HaveAttempt{get;set;}
    public Statut Statut{get;set;}
    public int Note{get;set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}
    public ICollection<Question> Questions {get;set;} = new List<Question>();
    public ICollection<Attempt> Attempts {get;set;} = new List<Attempt>();
 }

public class QuizSaveDTO{
    public int DatabaseId{get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsTest {get; set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}
    public ICollection<QuestionSaveDTO> Questions {get;set;} = new List<QuestionSaveDTO>();
}

public class QuizUpdateDTO{
    public int Id {get;set;}
    public int DatabaseId{get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsTest {get; set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}
    public ICollection<QuestionSaveDTO> Questions {get;set;} = new List<QuestionSaveDTO>();
}