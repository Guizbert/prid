using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2324_a12.Models;

public class Answer {

    [Key]
    public int Id {get; set;}
    public string Sql {get; set;} = null!;
    public DateTimeOffset? TimeStamp {get; set;}
    public bool IsCorrect {get; set;}
    [ForeignKey(nameof(AttemptId))]
    public Attempt Attempt{get;set;}= null!;
    public int AttemptId{get;set;}
}