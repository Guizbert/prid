using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace prid_2324_a12.Models;

public class Answer {

    [Key]
    public int Id {get; set;}
    public string Sql {get; set;} = null!;
    public DateTimeOffset? TimeStamp {get; set;}
    public bool IsCorrect {get; set;}
    
    [ForeignKey(nameof(AttemptId))]    [JsonIgnore]
    public Attempt Attempt{get;set;}= null!;
    public int AttemptId{get;set;}

    [ForeignKey(nameof(QuestionId))]
    public Question Question {get;set;} = null!;
    public int QuestionId{get;set;}

    //public virtual ICollection<Attempt> Attempts {get;set;}= new HashSet<Attempt>();
}