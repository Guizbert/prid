using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using prid_2324_a12.Helpers;

namespace prid_2324_a12.Models;

public class UserValidator : AbstractValidator<User>
{
    private readonly MsnContext _context;

    public UserValidator(MsnContext context) 
    {
        _context = context;

        RuleFor(m=> m.Pseudo)
            .NotEmpty() //ou NotNull() voir  : https://github.com/FluentValidation/FluentValidation/blob/main/docs/cascade.md
            .MinimumLength(3)
            .MaximumLength(10)
        // .Matches("^[a-zA-Z][a-zA-Z0-9_]*$");
            .Matches(@"^[a-z][a-z0-9_]+$", RegexOptions.IgnoreCase);
            //                              accepte minuscule et maj
            // ^=depuis premier carac,$ =jusquau dernier  ;

        RuleFor(m=>m.Password)
            .NotEmpty()
            .Length(3,10);
            /*
                pour vérifier le password confirm 
                https://github.com/FluentValidation/FluentValidation/blob/main/docs/built-in-validators.md#equal-validator
            */


        RuleFor(m => m.BirthDate)
            .LessThan(DateTime.Today)
            //si la premiere règle est pas bonne on passe pas dans le dependent rule
            .DependentRules(() => {
                RuleFor(m => m.Age)
                    .InclusiveBetween(18,125);
                    //https://docs.fluentvalidation.net/en/latest/aspnet.html
                    
            });    
        


        When(m => m.FirstName.Length>0, () =>{
             RuleFor(m => m.FirstName)
            .MinimumLength(3)
            .MaximumLength(50)
            //    .Matches("^(?![ \t])[A-Za-z]+(?<![ \t])$");
            .Matches(@"^\S.*\S$");
        });
       


        When(m => m.LastName.Length>0, () =>{
            RuleFor(m => m.LastName)
            //.Length(3,50)
            .MinimumLength(3)
            .MaximumLength(50)
            //.Matches("^(?![ \t])[A-Za-z]+(?<![ \t])$");
            .Matches(@"^\S.*\S$");
        });
        

        // si on avait fait ça sur le member, ça aurait affiche tout les info du member (donc on aurait eu toutes ses informations)
        // comme ça on affiche que lastname et firstname
        RuleFor(m => new {m.LastName, m.FirstName}) 
            .Must(m => String.IsNullOrEmpty(m.LastName) && String.IsNullOrEmpty(m.FirstName) ||
                    !String.IsNullOrEmpty(m.LastName) && !String.IsNullOrEmpty(m.FirstName))
            .WithMessage("'Last name' and 'First name' must be both empty or both not empty");
            //doit avoir un message ici car sinon on recoit un message standard. sans indiquer la propriété
            //pas besoin de mustAsync car on va pas en db (voir pour id)


        RuleFor(m => new {m.Id,m.LastName, m.FirstName}) 
            .MustAsync((m, token) => BeUniqueFullName(m.Id, m.LastName, m.FirstName, token))
            .WithMessage("the combination of 'Last name' and 'First name' must be unique");

        RuleFor(m => new {m.Id,m.Pseudo}) 
            .MustAsync((m, token) => BeUniquePseudo(m.Id, m.Pseudo, token))
            .WithMessage("'{PropertyName}' must be unique");


        RuleFor(m => new {m.Id, m.Email})
            .MustAsync((m, token) => BeUniqueEmail(m.Id, m.Email, token))
            .OverridePropertyName(nameof(User.Email))
            .WithMessage("'{PropertyName}' must be unique");


        RuleFor(m => m.Email)
            .NotEmpty()
            .EmailAddress(); // https://github.com/FluentValidation/FluentValidation/blob/main/docs/built-in-validators.md#email-validator

            // Validations spécifiques pour la création
            RuleSet("create", () => {
                RuleFor(m => new{m.Id, m.Pseudo})
                    .MustAsync((m, cancellation) =>  BeUniquePseudo(m.Id,m.Pseudo, cancellation))
                    .WithMessage("'{PropertyName}' must be unique.");
            });

            RuleSet("authenticate", () => {
                RuleFor(m => m.Token)
                    .NotNull().OverridePropertyName("Password").WithMessage("Incorrect password");
            });
    }
    //passe l'id pour la modification du user si il existe deja!
    private async Task<bool> BeUniquePseudo(int id, string pseudo, CancellationToken token) 
    {
        return !await _context.Users.AnyAsync(m=> m.Id != id &&
                                                    m.Pseudo == pseudo,
                                                cancellationToken: token);
    }
    private async Task<bool> BeUniqueEmail(int id, string email, CancellationToken token) 
    {
        return !await _context.Users.AnyAsync(m=> m.Id != id &&
                                                    m.Email == email,
                                                cancellationToken: token);
    }
    //POUR VALIDATION PASSWORD :
    // https://github.com/FluentValidation/FluentValidation/blob/main/docs/built-in-validators.md#equal-validator


    private async Task<bool> BeUniqueFullName(int id, string? lastName, string? firstName, CancellationToken token)
    {
        if(String.IsNullOrEmpty(lastName)&& String.IsNullOrEmpty( firstName)) return true;
        return !await _context.Users.AnyAsync(m => m.Id != id && 
                                                m.LastName == lastName &&
                                                m.FirstName == firstName, cancellationToken: token);
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(User user) 
    {
        return await this.ValidateAsync(user, o => o.IncludeRuleSets("default", "create"));
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateForAuthenticate(User? user) {
        if (user == null)
            return ValidatorHelper.CustomError("User not found.", "Pseudo");
        return await this.ValidateAsync(user!, o => o.IncludeRuleSets("authenticate"));
    }

    private async Task<bool> BeUniquePseudo(string pseudo, CancellationToken token) {
        return !await _context.Users.AnyAsync(m => m.Pseudo == pseudo);
    }

   
}

// pipe = succession de traitement 