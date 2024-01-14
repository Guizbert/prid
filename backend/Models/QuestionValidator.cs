// QuestionValidator.cs
using FluentValidation;
using System.Linq;
using prid_2324_a12.Helpers;

namespace prid_2324_a12.Models
{
    public class QuestionValidator : AbstractValidator<Question>
    {
        
        public QuestionValidator()
        {
            RuleFor(q => q.Order)
                .NotEmpty()
                .WithMessage("Chaque question doit avoir un numéro d'ordre unique.");

            RuleFor(q => q.Body)
                .NotEmpty()
                .MinimumLength(2)
                .WithMessage("La propriété Body d'une question doit contenir au moins deux caractères.");

            RuleFor(q => q.Solutions)
                .NotEmpty()
                .WithMessage("Chaque question doit avoir au moins une solution.");

             RuleForEach(q => q.Solutions)
                 .SetValidator(new SolutionValidator());
        }
    }
}
