using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace prid_2324_a12.Models;

public class UserValidator : AbstractValidator<User>
{
    private readonly MsnContext _context;

    public UserValidator(MsnContext context) {
        _context = context;
    

    //RuleFor(m=>m.Id).AutoIncrement();


    RuleFor(m=> m.Pseudo)
        .NotEmpty()
        .MinimumLength(3)
        .MaximumLength(10);

    RuleFor(m=>m.Password)
        .NotEmpty()
        .MinimumLength(3)
        .MaximumLength(10);
 
        RuleFor(m => m.BirthDate)
            .LessThan(DateTime.Today)
            .DependentRules(() => {
                RuleFor(m => m.Age)
                    .GreaterThanOrEqualTo(18);
            });

        // Validations spécifiques pour la création
        RuleSet("create", () => {
            RuleFor(m => m.Pseudo)
                .MustAsync(BeUniquePseudo)
                .WithMessage("'{PropertyName}' must be unique.");
        });
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(User user) {
        return await this.ValidateAsync(user, o => o.IncludeRuleSets("default", "create"));
    }

    private async Task<bool> BeUniquePseudo(string pseudo, CancellationToken token) {
        return !await _context.Users.AnyAsync(m => m.Pseudo == pseudo);
    }

    // private async Task<bool> BeUniqueFullName(string pseudo, string? fullName, CancellationToken token) {
    //     return !await _context.Users.AnyAsync(m => m.Pseudo != pseudo && m.FullName == fullName);
    // }
}
