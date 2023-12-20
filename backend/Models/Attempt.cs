using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace prid_2324_a12.Models;

public class Attempt {
    
    [Key]
    public int Id {get; set;}
    public DateTimeOffset? Start { get; set;}
    public DateTimeOffset? Finish {get; set;}

    [ForeignKey(nameof(UserId))]
    public User User{get;set;} = null!;
    public int UserId {get;set;}

    [ForeignKey(nameof(QuizId))]   [JsonIgnore]
    public Quiz Quiz {get;set;} = null!;
    public int QuizId {get;set;}

    public virtual ICollection<Answer> Answers {get;set;}= new HashSet<Answer>();

}