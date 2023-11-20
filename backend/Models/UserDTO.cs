namespace prid_2324_a12.Models;

public class UserDTO
{

    public int Id{get; set;}
    
    public string Pseudo {get; set;} = null!;

    public string Email {get; set;} = null!;

    public string? LastName{get; set;} 
    public string? FirstName{get; set;}
    public DateTimeOffset? BirthDate { get; set; }    
    public Role Role { get; set; } = Role.Student;
    public string? Token { get; set; }
    public ICollection<Quiz> Quizzes { get; set; } = new HashSet<Quiz>();
    public ICollection<Attempt> Attempts { get; set; } = new HashSet<Attempt>();
}

public class UserLoginDTO
{
    public string Pseudo {get; set;} = null!;
    public string Password {get; set;} = "";
}


public class UserWithPasswordDTO : UserDTO
{
    public string Password {get; set;} = ""; // peut mettre null! car on part du principe que ca peut etre vide
}