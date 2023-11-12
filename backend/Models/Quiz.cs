using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2324_a12.Models;

public class Quiz{
    [Key]
    public int Id {get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsClosed {get;set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}

    //devrait avoir une seule db ??
    public ICollection<Database> Databases {get;set;} = new HashSet<Database>();
    public ICollection<Question> Questions {get;set;} = new HashSet<Question>();
    public ICollection<Attempt> Attempts {get;set;} = new HashSet<Attempt>();


    
}