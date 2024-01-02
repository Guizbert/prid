using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace prid_2324_a12.Models;

public class Question {
    [Key]
    public int Id {get;set;}
    [ForeignKey(nameof(QuizId))]  [JsonIgnore]
    public Quiz Quiz{get;set;}= null!;
    public int QuizId{get;set;}
    
    public int Order{get;set;}
    public string Body{get;set;}= null!;

    public virtual ICollection<Answer> Answers {get;set;} = new HashSet<Answer>();
    
    public virtual ICollection<Solution> Solutions {get;set;} = new HashSet<Solution>();


}