using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2324_a12.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using prid_2324_a12.Helpers;
using System.Collections;

namespace prid_2324_a12.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize]
public class QuizController : ControllerBase
{

    private readonly MsnContext _context;
    private readonly IMapper _mapper;

    public QuizController(MsnContext context, IMapper mapper){
        _context = context;
        _mapper =mapper; 
    }

    private async Task<User?> GetLoggedMember() => await _context.Users.Where(u => u.Pseudo == User!.Identity!.Name).SingleOrDefaultAsync(); 

    [Authorized(Role.Teacher, Role.Admin)]
    [HttpGet("all/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAll(int userId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser.Id != userId || connectedUser.Role != Role.Teacher)
        {
            return BadRequest("Access Denied");
        }

        var quizzes = await _context.Quizzes
            .Include(q => q.Database)
            .OrderBy(q => q.Name)
            .ToListAsync();

        await UpdateQuizStatusForTeacher(quizzes, userId);

        return _mapper.Map<List<QuizDTO>>(quizzes);
    }

    [Authorized(Role.Teacher, Role.Admin)]
    private async Task UpdateQuizStatusForTeacher(List<Quiz> quizzes, int userId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser.Id != userId || connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }

        DateTimeOffset today = DateTimeOffset.Now;

        var user = await _context.Users.FindAsync(userId);

        foreach (var quiz in quizzes)
        {
            if (user.isTeacher())
            {
                if (!quiz.IsTest)
                {
                    if (quiz.IsPublished)
                    {
                        quiz.Statut = Statut.PUBLIE;
                    }
                }
                else if (quiz.IsTest)
                {
                    if (quiz.IsPublished)
                    {
                        if (quiz.Finish < today)
                        {
                            quiz.Statut = Statut.CLOTURE;
                        }
                        else
                        {
                            quiz.Statut = Statut.PUBLIE;
                        }
                    }
                }
                if (!quiz.IsPublished)
                    quiz.Statut = Statut.PAS_PUBLIE;
            }
        }
    }


    [Authorized(Role.Teacher, Role.Admin)]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDTO>> GetOne(int id){
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            return BadRequest("Access Denied");
        }
        var quiz = await _context.Quizzes
        .Include(q => q.Database)
        .Include(q => q.Questions.OrderBy(q => q.Order))
            .ThenInclude(qu => qu.Solutions.OrderBy(s => s.Order))
        .FirstOrDefaultAsync(q => q.Id == id);
        if (quiz == null)
            return NotFound();
        return _mapper.Map<QuizDTO>(quiz);
    }

    [HttpPut("updateQuiz")]
    public async Task<IActionResult> UpdateQuiz(QuizUpdateDTO editQuiz){
        var connectedUser = await GetLoggedMember();
        

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            return BadRequest("Access Denied");
        }
        var quiz = await _context.Quizzes.FindAsync(editQuiz.Id);
       
        if (quiz == null)
            return NotFound();
            
        await this.DeleteQuestion(quiz.Questions.ToList());
        await _context.SaveChangesAsync();


       foreach (var questionDTO in editQuiz.Questions)
        {
            //vérif si existe
            var existingQuestion = await GetExistingQuestion(questionDTO, quiz.Id);

            if (existingQuestion == null)
            {
                existingQuestion = await SaveQuestion(questionDTO, quiz.Id);

                if (existingQuestion == null)
                {
                    // Handle error or return appropriate response
                    return BadRequest("Failed to save a question.");
                }
            }

            foreach (var solutionDTO in questionDTO.Solutions)
            {
                if (!await SaveSolution(solutionDTO, existingQuestion.Id))
                {
                    // Handle error or return appropriate response
                    return BadRequest("Failed to save a solution.");
                }
            }
        }
        _mapper.Map<QuizUpdateDTO, Quiz>(editQuiz, quiz);
        

        if(!quiz.IsTest){
            quiz.Start = null; quiz.Finish = null;
        }
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> DeleteQuestion(List<Question> questions)
    {
        try
        {
            foreach (var question in questions)
            {
                // Delete all solutions with the question
                _context.Solutions.RemoveRange(question.Solutions);

                // Delete the question
                _context.Questions.Remove(question);
            }
            //save
            await _context.SaveChangesAsync();

            return true; // Return true if deletion is done
        }
        catch (Exception)
        {
            return false; // Return false if deletion fails
        }
    }



    [Authorized(Role.Teacher)]
    [HttpPost("postQuiz")]
    public async Task<ActionResult<QuizDTO>> PostQuiz(QuizSaveDTO savequiz)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }else{
            if(savequiz.IsTest && (savequiz.Start == null || savequiz.Finish == null)){
                return BadRequest("Failed to save the quiz (date are null ).");
            }
            var newQuiz = await SaveQuiz(savequiz);

            if (newQuiz == null)
            {
                // Handle error or return appropriate response
                return BadRequest("Failed to save the quiz.");
            }

            foreach (var questionDTO in savequiz.Questions) 
            {
                var existingQuestion = await GetExistingQuestion(questionDTO, newQuiz.Id);

                if (existingQuestion == null)
                {
                    existingQuestion = await SaveQuestion(questionDTO, newQuiz.Id);

                    if (existingQuestion == null)
                    {
                        // Handle error or return appropriate response
                        return BadRequest("Failed to save a question.");
                    }
                }

                foreach (var solutionDTO in questionDTO.Solutions)
                {
                    if (!await SaveSolution(solutionDTO, existingQuestion.Id))
                    {
                        // Handle error or return appropriate response
                        return BadRequest("Failed to save a solution.");
                    }
                }
            }
            return CreatedAtAction(nameof(GetOne), new { id = newQuiz.Id }, _mapper.Map<QuizDTO>(newQuiz));
        }
        
    }

    private async Task<Quiz> SaveQuiz([FromBody]QuizSaveDTO savequiz)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        if(!savequiz.IsTest && (savequiz.Start != null || savequiz.Finish != null)){
            savequiz.Start = null; savequiz.Finish = null;
        }
        var newQuiz = _mapper.Map<Quiz>(savequiz);

        var result = await new QuizValidator(_context).ValidateOnCreate(newQuiz);
        if (!result.IsValid)
        {
            return null;
        } 

        _context.Quizzes.Add(newQuiz);
        await _context.SaveChangesAsync(); // Save changes

        return newQuiz; 
    }

    private async Task<Question?> GetExistingQuestion(QuestionSaveDTO questionDTO, int quizId)
    {
        // Check if the question already exists
        
        return await _context.Questions
            .FirstOrDefaultAsync(q =>
                q.QuizId == quizId &&
                q.Order == questionDTO.Order &&
                q.Body == questionDTO.Body);
    }

    private async Task<Question> SaveQuestion(QuestionSaveDTO questionDTO, int quizId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        var questiondto = new QuestionSaveDTO
        {
            Order = questionDTO.Order,
            Body = questionDTO.Body,
            QuizId = quizId,
        };

        var newQuestion = _mapper.Map<Question>(questiondto);

        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync(); // Save changes to the database

        return newQuestion;
    }

    private async Task<bool> SaveSolution(SolutionDTO solutionDTO, int questionId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        // Check if the solution already exists
        var existingSolution = await _context.Solutions
            .FirstOrDefaultAsync(s =>
                s.QuestionId == questionId &&
                s.Order == solutionDTO.Order &&
                s.Sql == solutionDTO.Sql);

        if (existingSolution == null)
        {
            var solution = new Solution
            {
                Order = solutionDTO.Order,
                Sql = solutionDTO.Sql,
                QuestionId = questionId,
            };

            _context.Solutions.Add(solution);
            await _context.SaveChangesAsync(); // Save changes to the database
        }

        return true; // Return success, you can modify this based on your needs
    }



    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("test/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest(int userId){
        var connectedUser = await GetLoggedMember();
        if(connectedUser.Id != userId){
            return BadRequest("Access Denied");
        }
        var test =  await _context.Quizzes
            .Where(q => q.IsTest == true  && q.IsPublished)
            .Include(q => q.Database)
            .OrderBy(q => q.Name)
            .ToListAsync();

        await UpdateQuizStatusForCurrentUser(test,userId);

        return _mapper.Map<List<QuizDTO>>(test);

    }

    
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("quizzes/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetQuiz(int userId)
    {

        var connectedUser = await GetLoggedMember();
        if(connectedUser.Id != userId){
            return BadRequest("Access Denied");
        }
        var quizzes = await _context.Quizzes
            .Where(q => q.IsTest == false  && q.IsPublished)
            .Include(q => q.Database)
            .OrderBy(q => q.Name)
            .ToListAsync();
        // Update quiz status based on attempts
        await UpdateQuizStatusForCurrentUser(quizzes, userId);

        return _mapper.Map<List<QuizDTO>>(quizzes);
    }


    private async Task UpdateQuizStatusForCurrentUser(List<Quiz> quizzes, int userId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Id != userId)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        DateTimeOffset today = DateTimeOffset.Now;
        var user =await _context.Users.FindAsync(userId);

        
        
        foreach (var quiz in quizzes)
        {
            if(quiz.Start > today){
                quiz.CanInteract = false;
            }else{
                quiz.CanInteract = true;
            }
            if(quiz.Finish < today){
                quiz.Statut = Statut.CLOTURE;
                quiz.IsClosed = true;
            }
            else{
                var attempt = await _context.Attempts
                    .OrderByDescending(a => a.Start)
                    .FirstOrDefaultAsync(a => a.QuizId == quiz.Id && a.UserId == userId);       // devrait le récup par la dernière date du finish et pas le premier
                if (attempt != null)
                {
                    quiz.HaveAttempt = true;
                    if(attempt.Finish != null ){
                        quiz.Statut = Statut.FINI;
                        if(quiz.IsTest ){
                            quiz.Note = await this.CalculateQuizNote(quiz,attempt);
                        }
                    }
                    else
                        quiz.Statut = Statut.EN_COURS;
                }else
                    quiz.Statut = Statut.PAS_COMMENCE;
            }
           
            
        }
    }
    private async Task<int> CalculateQuizNote(Quiz quiz, Attempt attempt)// idée vient de vlad
    {
        // Get the total number of questions in the quiz
        var totalQuestions = await _context.Questions.CountAsync(q => q.QuizId == quiz.Id);

        // Get the last answer for each question in the latest attempt
        var lastAnswers = await _context.Answers
            .Where(a => a.AttemptId == attempt.Id)
            .GroupBy(a => a.QuestionId)
            .Select(a => a.OrderByDescending(a => a.TimeStamp).First())
            .ToListAsync();

        // Count how many of these last answers are correct
        var correctAnswersCount = lastAnswers.Count(a => a != null && a.IsCorrect);

        // Calculate the score
        return totalQuestions > 0 ? correctAnswersCount * 10 / totalQuestions : 0;
    }


    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getQuestions")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestions(int quizId){
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions
            .Where(q => q.QuizId == quizId)
            .OrderBy(q => q.Order)
            .ToListAsync());
    }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("isTestByid/{id}")]
    public async Task<ActionResult<bool>> IsTest(int id)
    {
        bool isTest = await _context.Quizzes 
            .Where(q => q.Id == id)
            .Select(q => q.IsTest)
            .FirstOrDefaultAsync();

        return Ok(isTest);
    }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("haveAttempt/{quizId}/{userId}")]
    public async Task<ActionResult<bool>> HaveAttempt(int quizId,int userId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Id != userId)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        bool hasAttempt = await _context.Quizzes
            .Where(q => q.Id == quizId)
            .Select(q => q.Attempts.Any(a => a.UserId == userId)) // Vérifie si l'utilisateur a déjà une tentative
            .FirstOrDefaultAsync();

        return Ok(hasAttempt);
    }

    [Authorized(Role.Teacher, Role.Admin)]
    [HttpGet("anyAttempt/{quizId}")]
    public async Task<ActionResult<bool>> AnyAttempt(int quizId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        bool hasAttempt = await _context.Quizzes
            .Where(q => q.Id == quizId && q.Attempts.Any()) 
            .AnyAsync();

        return Ok(hasAttempt);
    }

    [Authorized(Role.Teacher, Role.Admin)]
    [HttpGet("NameAvailable/{name}/{quizId}")]
    public async Task<bool> NameAvailable(string name, int quizId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        return !await _context.Quizzes.AnyAsync(q => q.Id != quizId && q.Name == name);
    }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getAttempt/{quizId}/{userId}/{questionId}")]
    public async Task<ActionResult<AttemptDTO>> GetAttempt(int quizId, int userId, int questionId)
    {

        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Id != userId)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        var attempt = await _context.Quizzes
            .Where(q => q.Id == quizId)
            .SelectMany(q => q.Attempts)
            .OrderByDescending(a => a.Start)
            .Include(a => a.Answers.Where(answer => answer.QuestionId == questionId).OrderByDescending(a => a.TimeStamp)) 
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (attempt == null)
        {
            return NotFound(); // or any other appropriate status code
        }


        return Ok(attempt); 
    }

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpPost("newAttempt/{quizId}/{userId}")]
    public async Task<ActionResult<AttemptDTO>> newAttempt(int quizId, int userId)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Id != userId)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        var newAttempt = new Attempt
            {
                Start = DateTimeOffset.Now,
                UserId = userId,
                QuizId = quizId,
            };
        _context.Attempts.Add(newAttempt);
        await _context.SaveChangesAsync();
        var attemptDTO = new AttemptDTO
            {
                Id = newAttempt.Id,
                Start = newAttempt.Start,
                Finish = newAttempt.Finish,
                UserId = newAttempt.UserId,
                QuizId = newAttempt.QuizId,
            };
        return Ok(attemptDTO);
    } 

    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getAllDatabase")]
    public async Task<ActionResult<IEnumerable<Database>>> GetAllDatabase(){
        return _mapper.Map<List<Database>>(await _context.Databases.ToListAsync());
    }

    [Authorized(Role.Teacher, Role.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var connectedUser = await GetLoggedMember();

        if (connectedUser != null && connectedUser.Role != Role.Teacher)
        {
            throw new UnauthorizedAccessException("Access Denied");
        }
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(qu => qu.Solutions)
            .Include(q => q.Attempts)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
        {
            return NotFound(); // or any other appropriate status code
        }

        // Delete solutions
        foreach (var question in quiz.Questions)
        {
            var answers = _context.Answers.Where(a => a.QuestionId == question.Id);
            _context.Answers.RemoveRange(answers);// Delete answers
            _context.Solutions.RemoveRange(question.Solutions);// Delete Solutions
        }
        
        var attempts = _context.Attempts.Where(a => a.QuizId == id);
        _context.Attempts.RemoveRange(attempts);// Delete answers

        // Delete questions
        _context.Questions.RemoveRange(quiz.Questions);

        // Delete the quiz
        _context.Quizzes.Remove(quiz);

        // Save changes
        await _context.SaveChangesAsync();

        return NoContent();
    }
}