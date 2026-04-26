using System.Security.Claims;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationController(
            NotificationService notificationService,
            UserManager<ApplicationUser> userManager)
        {
            _notificationService = notificationService;
            _userManager = userManager;
        }

        [HttpPost("register-token")]
        [Authorize]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterTokenRequest request)
        {
            if (request.UserId == Guid.Empty || string.IsNullOrWhiteSpace(request.FcmToken))
            {
                return BadRequest("UserId và FcmToken là bắt buộc.");
            }

            var callerUserId = User.FindFirstValue("UserId");
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && !string.Equals(callerUserId, request.UserId.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null)
            {
                return NotFound("Không tìm thấy user.");
            }

            await _notificationService.RegisterTokenAsync(request.UserId, request.FcmToken);
            return Ok(new { Message = "Đăng ký FCM token thành công." });
        }

        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendToRole([FromBody] SendNotificationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Role) ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest("Role, Title và Body là bắt buộc.");
            }

            var result = await _notificationService.SendToRoleAsync(request.Role, request.Title, request.Body);
            return Ok(result);
        }

        [HttpPost("send-to-user")]
        [Authorize]
        public async Task<IActionResult> SendToUser([FromBody] SendUserNotificationRequest request)
        {
            if (request.UserId == Guid.Empty ||
                string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Body))
            {
                return BadRequest("UserId, Title và Body là bắt buộc.");
            }

            var result = await _notificationService.SendToUserAsync(request.UserId, request.Title, request.Body);
            return Ok(result);
        }
    }

    public class RegisterTokenRequest
    {
        public Guid UserId { get; set; }
        public string FcmToken { get; set; } = string.Empty;
    }

    public class SendNotificationRequest
    {
        public string Role { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }

    public class SendUserNotificationRequest
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
}
