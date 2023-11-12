using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2324_a12.Models;

public class Attempt {
    
    [Key]
    public int Id {get; set;}
    public DateTimeOffset? Start { get; set;}
    public DateTimeOffset? Finish {get; set;}

    [ForeignKey(nameof(UserId))]
    public User User{get;set;} = null!;
    public int UserId {get;set;}

    [ForeignKey(nameof(QuizId))]
    public Quiz Quiz {get;set;} = null!;
    public int QuizId {get;set;}
}