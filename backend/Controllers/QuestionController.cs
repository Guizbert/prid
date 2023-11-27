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
    [HttpGet("quiz/{quizId}")]
    public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAll(int quizId){
        return _mapper.Map<List<QuestionDTO>>(await _context.Questions.Where(q => q.QuizId == quizId).ToListAsync());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionDTO>> GetOne(int id){
        var question = await _context.Questions.SingleOrDefaultAsync(q => q.Id == id);

        if (question == null)
            return NotFound();

        return _mapper.Map<QuestionDTO>(question);
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



//faire le put pour la modif

//faire le delete

}