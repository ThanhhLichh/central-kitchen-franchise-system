using System;
using System.ComponentModel.DataAnnotations;

namespace ProductionService.Models
{
    // Quản lý các trạng thái hợp lệ
    public enum PlanStatus
    {
        Pending,
        Processing,
        Done
    }

    public class ProductionPlan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string Status { get; set; } = PlanStatus.Pending.ToString().ToLower();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}