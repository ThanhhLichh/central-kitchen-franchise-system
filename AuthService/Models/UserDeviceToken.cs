namespace AuthService.Models
{
    public class UserDeviceToken
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public ApplicationUser? User { get; set; }
        public string FcmToken { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
