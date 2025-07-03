using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SupportTicketApp.Models
{
    public class User
    {
        public int Id { get; set; } 

        [Required]
        public string Name { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; } 

        [Required]
        public string Role { get; set; } 

        public ICollection<Ticket> CreatedTickets { get; set; }
    }
}
