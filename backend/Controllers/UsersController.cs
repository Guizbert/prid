using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2324_a12.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using prid_2324_a12.Helpers;

namespace prid_2324_a12.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly MsnContext _context;
    private readonly IMapper _mapper;
    private readonly TokenHelper _tokenHelper;

    /*
    Le contrôleur est instancié automatiquement par ASP.NET Core quand une requête HTTP est reçue.
    Les deux paramètres du constructeur recoivent automatiquement, par injection de dépendance, 
    une instance du context EF (MsnContext) et une instance de l'auto-mapper (IMapper).
    */
    public UsersController(MsnContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
        _tokenHelper = new TokenHelper(context);
    }
    private async Task<User?> GetLoggedMember() => await _context.Users.FindAsync(User!.Identity!.Name);

    //[Authorized(Role.Teacher)] 
    // que les teacher aurant droit a cette fonction (pourra servir pour récup les étudiants et leurs réponses)
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {

/*
    pk on utilise des DTO : 

        si on a pas de DTO et qu'on retourne un objet de type user ça fonctionnera mais on aura toutes les données du user (le mdp aussi)
        donc dto renvoie qu'un sous ensemble de nos données (UserDTO) qui a les mêmes proprietées sauf mdp

        Asp.NET renvoie du json

        si on utilisé que user il faudrait copié toutes les données du user et les renvoyer

        automapper fait une copie automatiquement et créer tout ce dont on a besoin (ça facilite la  vie :) ) merci Map

        2e interets : 

            si on a member et messages

            un message a un auteur, destinataire

            donc quand on charge la db on a des liens dans les 2 sens (avec DTO ça fait un cycle)

            donc sans DTO ça va renvoyer toutes les données (dont mdp) et le message va renvoyer un tableau (l'id, auteur(qui va renvoyer un tableau de user), destinataire(qui va renvoyer un tableau de user))
            donc il va tourner en boucle et renvoyer une erreur car ça sera trop long

            avec DTO (memberDTO/ messageDTO)

            un member DTO connait la liste des messages envoyés et recu et le messageDTO saura rien
            (JSON<-Member DTO -> messageDTO)
*/

        return _mapper.Map<List<UserDTO>>(await _context.Users.ToListAsync());
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDTO>> GetOne(int id) {
        // Récupère en BD le membre dont le pseudo est passé en paramètre dans l'url
        var user = await _context.Users.FindAsync(id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Transforme le membre en son DTO et retourne ce dernier
        return _mapper.Map<UserDTO>(user);
    }

    /* === SIGNUP === */

    [AllowAnonymous]
    [HttpPost("signup")]
    public async Task<ActionResult<UserDTO>> Signup(UserWithPasswordDTO user){
        return await PostUser(user);
    }

    [AllowAnonymous]
    [HttpGet("available/{pseudo}")]
    public async Task<ActionResult<bool>> IsAvailable(string pseudo) {
        bool isPseudoAvailable = await _context.Users.AnyAsync(user => user.Pseudo == pseudo);
        return !isPseudoAvailable;
    }


    [AllowAnonymous]
    [HttpGet("byPseudo/{pseudo}")]
    public async Task<ActionResult<UserDTO>> GetByPseudo(string pseudo) {
        var user = await _context.Users.SingleOrDefaultAsync(m => m.Pseudo == pseudo); // en cherche un seul 
        //avec where : Where(u => u.Pseudo == pseudo).SingleOrDefaultAsync();.
        // single or default comme ça si y a plusieurs résultats alors y aura une exception (firstOrDefault enverra que le premier (sauf si on sait qu'on en a plusieurs et qu'on a besoin du 1er))
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
        //peut ecrire Ok(_mapper.Map<UserDTO> (user);) mais pas besoin normalement
    }

    [AllowAnonymous]
    [HttpGet("byEmail/{email}")]
    public async Task<ActionResult<UserDTO>> GetByEmail(string email) {
        var user = await _context.Users.SingleOrDefaultAsync(m => m.Email == email); // en cherche un seul 
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDTO>> PostUser(UserWithPasswordDTO user) {
        var newUser = _mapper.Map<User>(user);                                      //fait un mapping vers une instance de user
        var result = await new UserValidator(_context).ValidateOnCreate(newUser);   // nouveau validator et faire une validation async
        if (!result.IsValid)
            return BadRequest(result);
        // hash pswd
        newUser.Password = TokenHelper.GetPasswordHash(newUser.Password);                                              //return status 400(bad Request) avec le resultat de la validation (JSON)
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();//creation en db

        return CreatedAtAction(nameof(GetOne), new { id = newUser.Id }, _mapper.Map<UserDTO>(newUser));
        /* 
            CreatedAtAction, nameOf{}, new{} génère l'url de getOne pour vérifier si c'est bien creer? 

            peut ecrire :  _mapper.Map<UserDTO>(newUser) à la place juste on aura pas l'url
        */
    }


    [HttpPut]
    public async Task<IActionResult> PutMember(UserDTO dto) {
        // Récupère en BD le membre à mettre à jour
        var user = await _context.Users.FindAsync(dto.Id);
        // Si aucun membre n'a été trouvé, renvoyer une erreur 404 Not Found
        if (user == null)
            return NotFound();
        // Mappe les données reçues sur celles du membre en question
        //vu que userDTO a pas le pswd ça va pas modif le pswd du user
        _mapper.Map<UserDTO, User>(dto, user);
        // Valide les données
        var result = await new UserValidator(_context).ValidateAsync(user);
        if (!result.IsValid)
            return BadRequest(result);
        // Sauve les changements
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        // Retourne un statut 204 avec une réponse vide
        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<ActionResult<UserDTO>> Authenticate(UserLoginDTO dto) {
        var user = await Authenticate(dto.Pseudo, dto.Password);

        var result = await new UserValidator(_context).ValidateForAuthenticate(user);
        if (!result.IsValid)
            return BadRequest(result);

        return Ok(_mapper.Map<UserDTO>(user));
    }

    private async Task<User?> Authenticate(string pseudo, string password) {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);

        // return null if member not found
        if (user == null)
            return null;

        var hash = TokenHelper.GetPasswordHash(password); 
        if (user.Password == hash) {
            // authentication successful so generate jwt token
            user.Token = TokenHelper.GenerateJwtToken(user.Pseudo, user.Role);
            var refreshToken = TokenHelper.GenerateRefreshToken();
            await _tokenHelper.SaveRefreshTokenAsync(pseudo, refreshToken);
        }

        return user;
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<TokensDTO>> Refresh([FromBody] TokensDTO tokens) {
        var principal = TokenHelper.GetPrincipalFromExpiredToken(tokens.Token);
        var pseudo = principal.Identity?.Name!;
        var savedRefreshToken = await _tokenHelper.GetRefreshTokenAsync(pseudo);
        if (savedRefreshToken != tokens.RefreshToken)
            throw new SecurityTokenException("Invalid refresh token");
        var newToken = TokenHelper.GenerateJwtToken(principal.Claims);
        var newRefreshToken = TokenHelper.GenerateRefreshToken();
        await _tokenHelper.SaveRefreshTokenAsync(pseudo, newRefreshToken);
        
        return new TokensDTO {
            Token = newToken,
            RefreshToken = newRefreshToken
        };
    }

}
