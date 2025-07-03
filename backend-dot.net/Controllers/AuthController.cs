using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicketApp.Data;
using SupportTicketApp.DTOs;
using SupportTicketApp.Models;
using SupportTicketApp.Services.Email;
using SupportTicketApp.Services.Jwt;
using System.Security.Cryptography;
using System.Text;


namespace SupportTicketApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwt;

    public AuthController(ApplicationDbContext context, IJwtService jwt)
    {
        _context = context;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "User already exists" });
        
        var role = (dto.Role ?? "user").ToLower();
        if (role != "user" && role != "agent" && role != "admin")
        return BadRequest(new { message = "Rôle invalide. Rôles autorisés : user, agent, admin" });
        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Role = dto.Role ?? "user",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Created("", new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            message = "Inscription réussie. Veuillez vous connecter."
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var token = _jwt.GenerateToken(user.Id, user.Role);

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            token
        });
    }
}
