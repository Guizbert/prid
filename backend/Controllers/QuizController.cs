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
    //faire function getQuiz (non test) et getTest

    private readonly MsnContext _context;
    private readonly IMapper _mapper;

    public QuizController(MsnContext context, IMapper mapper){
        _context = context;
        _mapper =mapper; 
    }

    private async Task<User?> GetLoggedMember() => await _context.Users.FindAsync(User!.Identity!.Name);

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetAll(){
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes.ToListAsync());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDTO>> GetOne(int id){
        var quiz = await _context.Quizzes.FindAsync(id);
        if (quiz == null)
            return NotFound();
        return _mapper.Map<QuizDTO>(quiz);
    }

    [Authorized(Role.Teacher)]
    [HttpPost]
    public async Task<IActionResult> PostTest(QuizDTO quiz){
        var newQuiz = _mapper.Map<Quiz>(quiz);
        //est-ce qu'il doit être unique ? 
        _context.Quizzes.Add(newQuiz);
        await _context.SaveChangesAsync();//creation en db
        return CreatedAtAction(nameof(GetOne), new { id = newQuiz.Id }, _mapper.Map<QuizDTO>(newQuiz));
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("test/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest(int userId){
        var test =  await _context.Quizzes
            .Where(q => q.IsTest == true)
            .Include(q => q.Database)
            //.Include(q => q.Attempts)
            .OrderBy(q => q.Name)
            .ToListAsync();

        await UpdateQuizStatusForCurrentUser(test,userId);

        return _mapper.Map<List<QuizDTO>>(test);

    }

    
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("quizzes/{userId}")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetQuiz(int userId)
    {

        var quizzes = await _context.Quizzes
            .Where(q => q.IsTest == false)
            .Include(q => q.Database)
            //.Include(q => q.Attempts)
            .OrderBy(q => q.Name)
            .ToListAsync();
        // Update quiz status based on attempts
        await UpdateQuizStatusForCurrentUser(quizzes, userId);

        return _mapper.Map<List<QuizDTO>>(quizzes);
    }


    [AllowAnonymous]
    private async Task UpdateQuizStatusForCurrentUser(List<Quiz> quizzes, int userId)
    {
        DateTimeOffset today = DateTimeOffset.Now;

        foreach (var quiz in quizzes)
        {
            if(quiz.Finish < today){
                quiz.Statut = Statut.CLOTURE;
                quiz.IsClosed = true;
            }
            else{
                var attempt = await _context.Attempts
                    .OrderByDescending(a => a.Finish)
                    .FirstOrDefaultAsync(a => a.QuizId == quiz.Id && a.UserId == userId);       // devrait le récup par la dernière date du finish et pas le premier


                if (attempt != null)
                {
                    quiz.HaveAttempt = true;
                    if(attempt.Finish != null ){
                        quiz.Statut = Statut.FINI;
                        if(quiz.IsTest){
                            
                            var totalQuestions = await _context.Questions
                                                        .Where(q => q.QuizId == quiz.Id)
                                                        .CountAsync();
                            var correctAnswersCount = await _context.Answers
                                                        .Where(a => a.AttemptId == attempt.Id && a.IsCorrect)
                                                        .CountAsync();
                            
                            quiz.Note = ((correctAnswersCount * 10)/ totalQuestions) ;
                        }
                    }
                    else
                        quiz.Statut = Statut.EN_COURS;
                 

                    // Update quiz status based on attempt
                    //quiz.Status = attempt.Status;
                }else
                    quiz.Statut = Statut.PAS_COMMENCE;
                Console.WriteLine("statut : " + quiz.Statut);

            }
        }
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getQuestions")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestions(int quizId){
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions
            .Where(q => q.QuizId == quizId)
            .OrderBy(q => q.Order)
            .ToListAsync());
    }

    [AllowAnonymous]
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

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("haveAttempt/{quizId}/{userId}")]
    public async Task<ActionResult<bool>> HaveAttempt(int quizId,int userId)
    {
        bool hasAttempt = await _context.Quizzes
            .Where(q => q.Id == quizId)
            .Select(q => q.Attempts.Any(a => a.UserId == userId)) // Vérifie si l'utilisateur a déjà une tentative
            .FirstOrDefaultAsync();

        return Ok(hasAttempt);
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getAttempt/{quizId}/{userId}/{questionId}")]
    public async Task<ActionResult<AttemptDTO>> GetAttempt(int quizId, int userId, int questionId)
    {
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


    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpPost("newAttempt/{quizId}/{userId}")]
    public async Task<ActionResult<AttemptDTO>> newAttempt(int quizId, int userId)
    {
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

//faire le put pour la modif

//faire le delete

}