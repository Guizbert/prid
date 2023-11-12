using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace prid_2324_a12.Models;

public class Database{
    [Key]
    public int Id{get;set;}
    public string Name{get;set;} = null!;
    public string? Description {get;set;}
}