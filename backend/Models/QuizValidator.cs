// QuizValidator.cs
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using prid_2324_a12.Helpers;

namespace prid_2324_a12.Models
{
    public class QuizValidator : AbstractValidator<Quiz>
    {
        private readonly MsnContext _context;

        public QuizValidator(MsnContext context)
        {
            _context = context;

            RuleFor(q => q.Name)
                .NotEmpty()
                .MinimumLength(3);

            RuleFor(q => q.Name)
                .Must(BeUniqueName)
                .WithMessage("Le nom du quiz doit être unique.");
                
            RuleFor(q => q.Start)
                .LessThanOrEqualTo(q => q.Finish)
                .When(q => q.IsTest == true)
                .WithMessage("La date de début ne peut pas être supérieure à la date de fin pour un quiz de type test.");

            RuleForEach(q => q.Questions)
                .SetValidator(new QuestionValidator());
        }

        private bool BeUniqueName(string name)
        {
            return !_context.Quizzes.Any(q => q.Name == name);
        }

        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Quiz quiz) 
        {
            return await this.ValidateAsync(quiz, o => o.IncludeRuleSets("default", "create"));
        }

    }
}



