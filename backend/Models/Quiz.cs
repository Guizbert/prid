using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace prid_2324_a12.Models;


public enum Statut{
    PAS_COMMENCE= 0,
    OUVERT=1,
    EN_COURS=2,
    CLOTURE =3,
    FINI= 4,
    PUBLIE= 5,
    PAS_PUBLIE=6,
}

//rajouter la property statut et check en backend le statut
public class Quiz{
    [Key]
    public int Id {get;set;}
    public string Name{get;set;}= null!;
    public string? Description {get;set;}
    public bool IsPublished {get;set;}
    public bool IsClosed {get;set;}
    public bool IsTest {get; set;}
    public DateTimeOffset? Start {get;set;}
    public DateTimeOffset? Finish {get;set;}
    [ForeignKey(nameof(DatabaseId))]
    public Database Database {get;set;}= null!;
    public int DatabaseId {get;set;}
    

    public Statut Statut {get;set;}

    [NotMapped]
    public int Note{get;set;}
    [NotMapped]
    public bool CanInteract{get;set;}
    [NotMapped]
    public bool HaveAttempt{get;set;}
    // [ForeignKey(nameof(CreatorId))]
    // public User Creator {get;set;}
    // public int CreatorId {get;set;}
    //devrait avoir une seule db ??
   // public ICollection<Database> Databases {get;set;} = new HashSet<Database>();
    [JsonIgnore]
    public ICollection<Question> Questions {get;set;} = new HashSet<Question>();

    [JsonIgnore]
    public ICollection<Attempt> Attempts {get;set;} = new HashSet<Attempt>();

   public string getStatutasString(){
        switch(Statut)
        {
            case Statut.PAS_COMMENCE:
                return "PAS_COMMENCE";
            case Statut.OUVERT:
                return "OUVERT";
            case Statut.EN_COURS:
                return "EN_COURS";
            case Statut.CLOTURE:
                return "CLOTURE";
            case Statut.FINI:
                return "FINI";
            default:
                return "PAS_COMMENCE";
        }
   }
   public string getNote(){
        if(this.Note > 0)
            return this.Note + "/10";
        else
            return "N/A";
   }


}