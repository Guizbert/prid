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
    [HttpGet("test")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetTest(){
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes.Where(q=>q.IsTest ==true).ToListAsync());
    }

    
    [AllowAnonymous]
    [Authorized(Role.Teacher, Role.Student, Role.Admin)]
    [HttpGet("quizzes")]
    public async Task<ActionResult<IEnumerable<QuizDTO>>> GetQuiz(){
        return _mapper.Map<List<QuizDTO>>(await _context.Quizzes.Where(q=>q.IsTest ==false).ToListAsync());
    }


//faire le put pour la modif

//faire le delete

}