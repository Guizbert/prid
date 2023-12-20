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
    [HttpGet("getByQuiz/{quizId}")]
    public async Task<Question?> GetByQuiz(int quizId){
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

    // [AllowAnonymous]
    // [HttpGet("getQuiz/{id}")]
    // public async Task<ActionResult<QuizDTO>> GetQuizByQuestion(int id){
    //     var question = await _context.Questions.SingleOrDefaultAsync(q => q.QuizId == id);

    //     if (question == null)
    //         return NotFound();

    //     var quizDTO = _mapper.Map<QuizDTO>(question.Quiz);
    //     return quizDTO;
    // }


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
        //var soluce = await getFirstSoluce(sqldto.QuestionId);

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
        
        if(userQuery.Error.Length > 0)
            return userQuery;
        

        SqlSolutionDTO solutionQuery = soluceQuery.ExecuteQuery();

        //userQuery.CheckQueries(solutionQuery);
        //   SqlDTO correctQuery = new SqlDTO(){

        //   }
        if (userQuery.Data is not null && solutionQuery.Data is not null)
            userQuery.CheckQueries(solutionQuery);
        else
            userQuery.Error = new string[] { "Errors while sending the data" };

        return userQuery;

    }



//faire le put pour la modif

//faire le delete

}