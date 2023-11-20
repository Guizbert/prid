namespace prid_2324_a12.Models;

public class AttemptDTO
{

    public int Id {get; set;}
    public DateTimeOffset? Start { get; set;}
    public DateTimeOffset? Finish {get; set;}
    public User user{get;set;} = null!;
}