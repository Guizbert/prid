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
using MySql.Data.MySqlClient;
using System.Data;

namespace prid_2324_a12.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize]
public class QuestionController : ControllerBase
{
    //faire function getQuiz (non test) et getTest
    private async Task<User?> GetLoggedMember() => await _context.Users.FindAsync(User!.Identity!.Name);

    private readonly MsnContext _context;
    private readonly IMapper _mapper;

    public QuestionController(MsnContext context, IMapper mapper){
        _context = context;
        _mapper =mapper; 
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAll(){
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions.ToListAsync());
    }

    [AllowAnonymous]
    [HttpGet("getFirstQuestion/{quizId}/{userId}")]
    public async Task<Question?> GetFirstQuestion(int quizId, int userId){
        var attempt = await _context.Attempts.Where(a => a.QuizId == quizId && a.UserId == userId).OrderByDescending(a => a.Finish).FirstOrDefaultAsync();
        if(attempt != null ){
            if(attempt.Finish != null){
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
                    //Finish = newAttempt.Finish,
                    UserId = newAttempt.UserId,
                    QuizId = newAttempt.QuizId,
                };
            }
        }else{
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
                    //Finish = newAttempt.Finish,
                    UserId = newAttempt.UserId,
                    QuizId = newAttempt.QuizId,
                };
        }
        var question = await _context.Questions.Where(q => q.QuizId == quizId).ToListAsync();
        return question[0];
    }

    [AllowAnonymous]
    [HttpGet("getFirstQuestionReadOnly/{quizId}/{userId}")]
    public async Task<Question?> GetFirstQuestionReadOnly(int quizId, int userId){
        var question = await _context.Questions.Where(q => q.QuizId == quizId).ToListAsync();
        return question[0];
    }
    
    [AllowAnonymous]
    [HttpGet("getOther/{questionId}")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetByQuestion(int questionid){
        // Récupérer le quizId de la question actuelle
            var quizId = await _context.Questions
                .Where(q => q.Id == questionid)
                .Select(q => q.QuizId)
                .FirstOrDefaultAsync();

            // Récupérer toutes les questions liées au quizId
            var questions = await _context.Questions
                .Where(q => q.QuizId == quizId)
                .ToListAsync();
            // Mapper et retourner les questions en format DTO
            var questionsDTO = _mapper.Map<List<QuestionDTO>>(questions);
            return questionsDTO;
    }

    [AllowAnonymous]
    [HttpGet("byId/{id}")]
    public async Task<ActionResult<QuestionDTO>> GetOne(int id){
       var question = await _context.Questions
            .Include(q => q.Quiz)
                .ThenInclude(quiz => quiz.Database)
            .Include(q => q.Solutions)
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question == null)
            return NotFound();

        var questionDTO = _mapper.Map<QuestionDTO>(question);
        return questionDTO;
    }



    [AllowAnonymous]
    [Authorized(Role.Teacher)]
    [HttpPost]
    public async Task<IActionResult> PostQuestion(QuestionDTO question){
        // Mapper le QuestionDTO vers Question
        var newQuestion = _mapper.Map<Question>(question);
        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = newQuestion.Id }, _mapper.Map<QuestionDTO>(newQuestion));
    }


    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getQuestionss/{quizId}")]
    public async Task<ActionResult<List<int>>> GetQuestionss(int quizId){
        var questionIds = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .OrderBy(q => q.Order)
            .Select(q => q.Id)
            .ToListAsync();

        return questionIds;
    }


    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("getdata/{dbname}")]
    public async Task<ActionResult<Dictionary<string, List<string>>>> getdata(string dbname){
        string connectionString = $"server=localhost;database={dbname};uid=root;password=root";
        using MySqlConnection connection = new MySqlConnection(connectionString);
        List<string> tableNames = new List<string>();
        try
        {
            connection.Open();
            DataTable schema = connection.GetSchema("Tables");

            foreach (DataRow row in schema.Rows)
            {
                string tableName = row["TABLE_NAME"].ToString();
                tableNames.Add(tableName);
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error: {e.Message}");
        }
        return Ok(tableNames); 
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("GetAllColumnNames/{dbName}")]
    public async Task<ActionResult<Dictionary<string, List<string>>>> GetAllColumnNames(string dbName)
    {
        string connectionString = $"server=localhost;database={dbName};uid=root;password=root";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        List<string> columnNames = new List<string>();

        try
        {
            connection.Open();
            DataTable schema = connection.GetSchema("Columns");

            foreach (DataRow row in schema.Rows)
            {
                string columnName = row["COLUMN_NAME"].ToString();
                columnNames.Add(columnName);
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error: {e.Message}");
        }

        return Ok(columnNames);
    }

// faire ça dans le model question avec les fonctions du front
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpPost("querySent")]
    public async Task<ActionResult<object>> Sql(SqlDTO sqldto)
    {
        string soluce = await _context.Solutions.Where(s => s.QuestionId == sqldto.QuestionId).Select(s => s.Sql).FirstOrDefaultAsync();
        if (soluce == null)
        {
            // Handle the case where no solution is found
            return NotFound();
        }
        SqlDTO soluceQuery = new SqlDTO{
            QuestionId = sqldto.QuestionId,
            Query = soluce!,
            DbName = sqldto.DbName
        };
        SqlSolutionDTO userQuery = sqldto.ExecuteQuery();
        // if(userQuery.Error.Length > 0)
        //     return userQuery;
        SqlSolutionDTO solutionQuery = soluceQuery.ExecuteQuery();
        if (userQuery.Data is not null && solutionQuery.Data is not null)
            userQuery.CheckQueries(solutionQuery);
        else
            userQuery.Error = new string[] { "Errors while sending the data" };

        if(sqldto.NewAnswer){
            userQuery.TimeStamp = DateTimeOffset.Now;

            var answer = new Answer 
            {
                Sql = sqldto.Query,
                TimeStamp = DateTimeOffset.Now,
                IsCorrect = userQuery.isCorrect,
                AttemptId = sqldto.AttemptId,
                QuestionId = sqldto.QuestionId                
            };

            _context.Answers.Add(answer);
            await _context.SaveChangesAsync();

            var answerDTO = new AnswerDTO
            {
                Id = answer.Id,
                Sql = answer.Sql,
                TimeStamp = answer.TimeStamp,
                IsCorrect = answer.IsCorrect,
                AttemptId = answer.AttemptId,
                QuestionId = answer.QuestionId,
            };
        }else{
            var answer = await _context.Answers.Where(a => a.AttemptId == sqldto.AttemptId && a.QuestionId == sqldto.QuestionId).OrderByDescending(a => a.TimeStamp).FirstOrDefaultAsync();
            userQuery.TimeStamp = answer.TimeStamp;
            Console.WriteLine(answer + " <-----------");
        }
        return userQuery;
    }

    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("endAttempt/{attemptId}")]
    public async Task<ActionResult<object>> EndAttempt(int attemptId)
    {
        var attempt = await _context.Attempts.Where(a => a.Id == attemptId).FirstOrDefaultAsync();
        attempt.Finish = DateTimeOffset.Now;

        await _context.SaveChangesAsync();

        return _mapper.Map<AttemptDTO>(attempt);
    }


//faire le put pour la modif

//faire le delete

}