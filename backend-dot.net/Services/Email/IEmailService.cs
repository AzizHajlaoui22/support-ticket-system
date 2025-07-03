namespace SupportTicketApp.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendTicketStatusUpdateEmail(string to, int ticketId, string newStatus);
        Task SendTicketAssignedEmail(string to, int ticketId, string senderName, string senderRole);
    }
}
