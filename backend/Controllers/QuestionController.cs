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
            .Include(q => q.Quiz) // Include the associated Quiz entity
                .ThenInclude(quiz => quiz.Database)
            .Include(q => q.Solutions) // Include Solutions for the question
            .Include(q => q.Answers)
                .ThenInclude(q => q.Attempts)
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
    public async Task<ActionResult<object>> GetSqldata(string dbname){
        
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


    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("querySent/{query}/{dbname}")] // si je met {query} / {dbname} ça return une erreur mais renvoie les données correcte. si je met pas le dbname swagger refonctionne mais le front fonctionne plus bruh
    public async Task<ActionResult<object>> Sql(string query, string dbname)
    {
        // Your connection string, replace with actual details
        string connectionString = $"server=localhost;database={dbname};uid=root;password=root";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table = new DataTable();

        try
        {
            connection.Open();
            MySqlCommand command = new MySqlCommand($"SET sql_mode = 'STRICT_ALL_TABLES'; {query}", connection);
            MySqlDataAdapter adapter = new MySqlDataAdapter(command);
            adapter.Fill(table);
        }
        catch (Exception e)
        {
            // Handle the exception
            Console.WriteLine($"Error: {e.Message}");
        }

        // Get column names
        string[] columns = new string[table.Columns.Count];
        for (int i = 0; i < table.Columns.Count; ++i)
            columns[i] = table.Columns[i].ColumnName;

        Console.WriteLine("Columns: ");
        Console.WriteLine(string.Join(", ", columns));

        // Get data
        string[][] data = new string[table.Rows.Count][];
        for (int j = 0; j < table.Rows.Count; ++j)
        {
            data[j] = new string[table.Columns.Count];
            for (int i = 0; i < table.Columns.Count; ++i)
            {
                object value = table.Rows[j][i];
                string str;
                if (value == null)
                    str = "NULL";
                else
                {
                    if (value is DateTime d)
                    {
                        if (d.TimeOfDay == TimeSpan.Zero)
                            str = d.ToString("yyyy-MM-dd");
                        else
                            str = d.ToString("yyyy-MM-dd hh:mm:ss");
                    }
                    else
                        str = value?.ToString() ?? "";
                }
                data[j][i] = str;
            }
        }
        Console.WriteLine("Data: ");
        for (int j = 0; j < table.Rows.Count; ++j)
        {
            Console.WriteLine(string.Join(", <-ici data ", data[j]));
        }
        return Ok(new { Columns = columns, Data = data });
    }



//faire le put pour la modif

//faire le delete

}