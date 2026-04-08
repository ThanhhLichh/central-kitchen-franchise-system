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

        [HttpPost("create-user")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            
            var userExists = await _userManager.FindByNameAsync(request.Username);
            if (userExists != null)
            {
                return BadRequest("Tên đăng nhập này đã tồn tại trong hệ thống.");
            }

            
            var newUser = new ApplicationUser
            {
                UserName = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                LocationType = request.LocationType,
                StoreId = request.StoreId,
                IsActive = true
            };

            
            var result = await _userManager.CreateAsync(newUser, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Lỗi tạo tài khoản: {errors}");
            }

            if (!string.IsNullOrEmpty(request.RoleName))
            {
                await _userManager.AddToRoleAsync(newUser, request.RoleName);
            }

            return Ok(new { Message = $"Tạo tài khoản {request.Username} và cấp quyền {request.RoleName} thành công!" });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (jti != null)
            {
                await _tokenCache.RevokeTokenAsync(jti, TimeSpan.FromMinutes(120));
            }
            return Ok("Đăng xuất thành công.");
        }

        [HttpGet("sync-users")]
        [Authorize]
        public IActionResult GetUsersForNifi([FromQuery] DateTime lastSyncTime)
        {
            var users = _userManager.Users
                .Where(u => u.UpdatedAt >= lastSyncTime)
                .Select(u => new { u.Id, u.UserName, u.Email, u.StoreId, u.LocationType, u.IsActive })
                .ToList();
            return Ok(users);
        }

        private JwtSecurityToken GenerateJwtToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"])),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
            return token;
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

        public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string LocationType { get; set; } 
        public Guid? StoreId { get; set; } 
        public string RoleName { get; set; } 
    }



}