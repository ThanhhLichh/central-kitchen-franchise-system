using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Models;
using AuthService.Services;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly TokenCacheService _tokenCache;
        private readonly NotificationService _notificationService;

        public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration, TokenCacheService tokenCache, NotificationService notificationService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _tokenCache = tokenCache;
            _notificationService = notificationService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                if (!user.IsActive) return Unauthorized("Tài khoản đã bị khóa.");

                var userRoles = await _userManager.GetRolesAsync(user);
                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("UserId", user.Id.ToString()),
                    new Claim("LocationType", user.LocationType ?? "")
                };
                
                if (user.StoreId.HasValue)
                {
                    authClaims.Add(new Claim("StoreId", user.StoreId.Value.ToString()));
                }

                foreach (var role in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                var token = GenerateJwtToken(authClaims);
                return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), expiration = token.ValidTo });
            }
            return Unauthorized("Sai tài khoản hoặc mật khẩu.");
        }

    }

}