using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace SupportTicketApp.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Support", _config["Email:User"]));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("plain") { Text = body };

            using var client = new SmtpClient();
            await client.ConnectAsync(_config["Email:Host"], int.Parse(_config["Email:Port"]), false);
            await client.AuthenticateAsync(_config["Email:User"], _config["Email:Pass"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }

        public Task SendTicketStatusUpdateEmail(string email, int ticketId, string status)
        {
            var subject = $"Mise à jour du ticket #{ticketId}";
            var text = $"Votre ticket #{ticketId} a été mis à jour.\nNouveau statut : {status}.";
            return SendEmailAsync(email, subject, text);
        }

        public Task SendTicketAssignedEmail(string email, int ticketId, string senderName, string senderRole)
        {
            var subject = $"Nouveau ticket assigné #{ticketId}";
            var text = $"Un ticket vous a été assigné par {senderName} ({senderRole}).";
            return SendEmailAsync(email, subject, text);
        }
    }
}
