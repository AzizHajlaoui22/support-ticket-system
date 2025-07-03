using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SupportTicketApp.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Status { get; set; } = "open"; // "open", "updated", "assigned", "closed"

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // 🔗 Foreign keys
        [ForeignKey("CreatedBy")]
        public int CreatedById { get; set; }
        public User CreatedBy { get; set; }

        [ForeignKey("AssignedTo")]
        public int? AssignedToId { get; set; }
        public User AssignedTo { get; set; }
    }
}
