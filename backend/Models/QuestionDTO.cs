namespace prid_2324_a12.Models;

public class QuestionDTO{
    public int Id{get;set;}
    public int Order{get;set;}
    public string Body{get;set;}= null!;
    public int QuizId{get;set;}
}