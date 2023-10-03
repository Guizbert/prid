using System.ComponentModel.DataAnnotations;

namespace prid_2324_a12.Models;

public class User

{
    [Key]
    public int Id { get; set;} 
    //auto increment dans constructor
    // https://stackoverflow.com/questions/35539928/auto-increment-id-c-sharp

    public string Pseudo {get; set;}= null!;

    public string Password {get; set;}= null!; // force a avoir une erreur si c'est vide

    public string Email {get; set;} = null!;
    //null! pour dire qu'il est non nullable 

    public string? LastName{get; set;} = "";

    public string? FirstName{get; set;} = "";

    public DateTimeOffset? BirthDate { get; set; }

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
}