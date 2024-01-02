// SolutionValidator.cs
using FluentValidation;
using System.Linq;
using prid_2324_a12.Helpers;
namespace prid_2324_a12.Models
{
    public class SolutionValidator : AbstractValidator<Solution>
    {
        public SolutionValidator()
        {
            RuleFor(s => s.Order)
                .NotEmpty()
                .WithMessage("Chaque solution doit avoir un numéro d'ordre unique.");

            RuleFor(s => s.Sql)
                .NotEmpty()
                .WithMessage("La propriété Sql d'une solution ne peut être vide.");
        }
    }
}