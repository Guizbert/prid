using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2324_a12.Models;

public class Solution{
    [Key]
    public int Id{get;set;}
    public int Order{get;set;}
    public string Sql {get;set;}= null!;

    [ForeignKey(nameof(QuestionId))]
    public Question Question{get;set;}= null!;
    public int QuestionId{get;set;}

}