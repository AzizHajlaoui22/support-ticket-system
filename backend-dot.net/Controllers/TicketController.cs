using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SupportTicketApp.Data;
using SupportTicketApp.Models;
using SupportTicketApp.Services.Email;
using System.Security.Claims;
using SupportTicketApp.DTOs;


namespace SupportTicketApp.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class TicketController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _email;

    public TicketController(ApplicationDbContext context, IEmailService email)
    {
        _context = context;
        _email = email;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
    private string GetUserRole() => User.FindFirstValue(ClaimTypes.Role);

[HttpPost]
[Authorize(Roles = "user")]
public async Task<IActionResult> CreateTicket([FromBody] TicketDto dto)
{
    var userId = GetUserId();

    var ticket = new Ticket
    {
        Title = dto.Title,
        Description = dto.Description,
        Status = "open",
        CreatedAt = DateTime.Now,
        UpdatedAt = DateTime.Now,
        CreatedById = userId
    };

    _context.Tickets.Add(ticket);
    await _context.SaveChangesAsync();

    var creator = await _context.Users.FindAsync(userId);
    if (creator?.Email != null)
        await _email.SendTicketStatusUpdateEmail(creator.Email, ticket.Id, ticket.Status);

    return CreatedAtAction(nameof(GetTicketById), new { id = ticket.Id }, ticket);
}

    [HttpGet("my")]
    public async Task<IActionResult> GetMyTickets()
    {
        var id = GetUserId();
        var tickets = await _context.Tickets
            .Where(t => t.CreatedById == id)
            .Include(t => t.AssignedTo)
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("assigned")]
    public async Task<IActionResult> GetAssignedTickets()
    {
        var id = GetUserId();
        var tickets = await _context.Tickets
            .Where(t => t.AssignedToId == id)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("all")]
    [Authorize(Roles = "admin,agent")]
    public async Task<IActionResult> GetAllTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTicketById(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return NotFound(new { message = "Ticket not found" });
        return Ok(ticket);
    }

    [HttpPut("{id}/assign")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignDto request)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found" });

        // 🚫 Bloquer l'assignation si le ticket est fermé
        if (ticket.Status == "closed")
        return BadRequest(new { message = "Cannot assign a closed ticket." });

        ticket.AssignedToId = request.AgentId;
        ticket.Status = "assigned";
        await _context.SaveChangesAsync();

        var creator = await _context.Users.FindAsync(ticket.CreatedById);
        if (creator?.Email != null)
            await _email.SendTicketStatusUpdateEmail(creator.Email, ticket.Id, ticket.Status);

        var agent = await _context.Users.FindAsync(request.AgentId);
        var sender = await _context.Users.FindAsync(GetUserId());
        if (agent?.Email != null)
            await _email.SendTicketAssignedEmail(agent.Email, ticket.Id, sender.Name, sender.Role);

        return Ok(ticket);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, [FromBody] TicketUpdateDto updated)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found" });

        var userId = GetUserId();
        var role = GetUserRole();

        var isCreator = ticket.CreatedById == userId;
        var isAssigned = ticket.AssignedToId == userId;

        if (role == "admin" || 
            (role == "user" && isCreator && ticket.Status != "closed" && ticket.AssignedToId == null) || 
            (role == "agent" && isAssigned))
        {
            ticket.Title = updated.Title ?? ticket.Title;
            ticket.Description = updated.Description ?? ticket.Description;
            ticket.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            var creator = await _context.Users.FindAsync(ticket.CreatedById);
            if (creator?.Email != null)
                await _email.SendTicketStatusUpdateEmail(creator.Email, ticket.Id, ticket.Status);

            return Ok(ticket);
        }

        return Forbid();
    }

    [HttpPut("{id}/close")]
    public async Task<IActionResult> CloseTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found" });

        var role = GetUserRole();
        var userId = GetUserId();

        if (role == "admin" || ticket.AssignedToId == userId)
        {
            ticket.Status = "closed";
            await _context.SaveChangesAsync();

            var creator = await _context.Users.FindAsync(ticket.CreatedById);
            if (creator?.Email != null)
                await _email.SendTicketStatusUpdateEmail(creator.Email, ticket.Id, ticket.Status);

            return Ok(ticket);
        }

        return Forbid();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return NotFound(new { message = "Ticket not found" });

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ticket supprimé avec succès." });
    }

    
}
