namespace prid_2324_a12.Models;

public class QuizDTO{
    public int Id {get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsClosed {get;set;}    
    public bool IsTest {get; set;}
    // public Statut Statut{get;set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}

}