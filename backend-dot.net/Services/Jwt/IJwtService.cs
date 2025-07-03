namespace SupportTicketApp.Services.Jwt
{
    public interface IJwtService
    {
        string GenerateToken(int userId, string role);
    }
}
