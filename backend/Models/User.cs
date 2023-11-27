using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid_2324_a12.Models;

public enum Role
{
    Student = 2,Teacher = 1, Admin =0
}

public class User
{

    private readonly MsnContext? _context;
    public User(){}

    public User(MsnContext context){
        this._context = context;
    } 

    [Key]
    public int Id { get; set;} 
    //auto increment dans constructor
    // https://stackoverflow.com/questions/35539928/auto-increment-id-c-sharp

    public string Pseudo {get; set;}= null!;

    public string Password {get; set;}= null!;  // force a avoir une erreur si c'est vide

    public string Email {get; set;} = null!;    //null! pour dire qu'il est non nullable 

    public string? LastName{get; set;} = "";
    public string? FirstName{get; set;} = "";
    public DateTimeOffset? BirthDate { get; set; }
    public Role Role { get; set; } = Role.Student;

    [NotMapped]
    public string? Token { get; set; }
    
    public string? RefreshToken { get; set; }


    
    public int? Age{
        get{
            if(!BirthDate.HasValue)
                return null;
            var today = DateTime.Today;
            var age = today.Year - BirthDate.Value.Year;
            if (BirthDate.Value.Date > today.AddYears(-age)) age--;
                return age;
        }
    }

    public ICollection<Attempt> Attempts = new HashSet<Attempt>();
    
    public bool isTeacher() {return this.Role == Role.Teacher;}
}