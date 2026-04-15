using Microsoft.AspNetCore.Identity;

namespace AuthService.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; }
        public bool IsActive { get; set; } = true;
        
        public Guid? StoreId { get; set; } 
        public string LocationType { get; set; } 
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}