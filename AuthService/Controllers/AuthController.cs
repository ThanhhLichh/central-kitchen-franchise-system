using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Models;
using AuthService.Services;
using AuthService.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

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
        private readonly AuthDbContext _dbContext;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            TokenCacheService tokenCache,
            NotificationService notificationService,
            AuthDbContext dbContext)
        {
            _userManager = userManager;
            _configuration = configuration;
            _tokenCache = tokenCache;
            _notificationService = notificationService;
            _dbContext = dbContext;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                if (!user.IsActive) return Unauthorized("Tài khoản đã bị khóa.");

                var userRoles = await _userManager.GetRolesAsync(user);
                var storeName = string.Empty;
                if (user.StoreId.HasValue)
                {
                    storeName = await _dbContext.Stores
                        .Where(s => s.Id == user.StoreId.Value)
                        .Select(s => s.Name)
                        .FirstOrDefaultAsync() ?? string.Empty;
                }

                var authClaims = BuildUserClaims(user, userRoles, storeName);
                var token = GenerateJwtToken(authClaims);
                var refreshToken = await IssueRefreshTokenAsync(user);

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    refreshToken
                });
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

            if (RequiresStoreAssignment(request.RoleName))
            {
                if (!request.StoreId.HasValue)
                {
                    return BadRequest("Role này bắt buộc phải có StoreId.");
                }

                var storeExists = await _dbContext.Stores.AnyAsync(s => s.Id == request.StoreId.Value);
                if (!storeExists)
                {
                    return BadRequest("StoreId không tồn tại.");
                }
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

            if (!string.IsNullOrWhiteSpace(request.FcmToken))
            {
                await _notificationService.SendAccountCreatedNotificationAsync(request.FcmToken, request.Username);
            }

            return Ok(new
            {
                Message = $"Tạo tài khoản {request.Username} và cấp quyền {request.RoleName} thành công!",
                newUser.Id,
                newUser.UserName,
                newUser.Email,
                newUser.FullName,
                newUser.StoreId
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (jti != null)
            {
                await _tokenCache.RevokeTokenAsync(jti, TimeSpan.FromMinutes(120));
            }

            var userId = User.FindFirst("UserId")?.Value;
            if (Guid.TryParse(userId, out var parsedUserId))
            {
                var user = await _userManager.FindByIdAsync(parsedUserId.ToString());
                if (user != null)
                {
                    await RevokeRefreshTokenAsync(user);
                }
            }

            return Ok("Đăng xuất thành công.");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var principal = GetPrincipalFromExpiredToken(request.Token);
            if (principal?.Identity?.Name == null)
            {
                return Unauthorized("Access token không hợp lệ.");
            }

            var user = await _userManager.FindByNameAsync(principal.Identity.Name);
            if (user == null || !user.IsActive)
            {
                return Unauthorized("User không hợp lệ hoặc đã bị khóa.");
            }

            var savedRefreshToken = await _userManager.GetAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenName);
            var refreshTokenExpiryValue = await _userManager.GetAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenExpiryName);

            if (string.IsNullOrWhiteSpace(savedRefreshToken) ||
                !string.Equals(savedRefreshToken, request.RefreshToken, StringComparison.Ordinal) ||
                !DateTime.TryParse(refreshTokenExpiryValue, out var refreshTokenExpiryUtc) ||
                refreshTokenExpiryUtc <= DateTime.UtcNow)
            {
                return Unauthorized("Refresh token không hợp lệ hoặc đã hết hạn.");
            }

            var userRoles = await _userManager.GetRolesAsync(user);
            var storeName = string.Empty;
            if (user.StoreId.HasValue)
            {
                storeName = await _dbContext.Stores
                    .Where(s => s.Id == user.StoreId.Value)
                    .Select(s => s.Name)
                    .FirstOrDefaultAsync() ?? string.Empty;
            }

            var authClaims = BuildUserClaims(user, userRoles, storeName);
            var newAccessToken = GenerateJwtToken(authClaims);
            var newRefreshToken = await IssueRefreshTokenAsync(user);

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(newAccessToken),
                expiration = newAccessToken.ValidTo,
                refreshToken = newRefreshToken
            });
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

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Include(u => u.Store)
                .ToListAsync();

            var response = new List<object>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                response.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FullName,
                    user.StoreId,
                    user.IsActive,
                    Roles = roles
                });
            }

            return Ok(response);
        }

        [HttpGet("users/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _userManager.Users
                .Include(u => u.Store)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound("Không tìm thấy user.");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.FullName,
                user.LocationType,
                user.StoreId,
                StoreName = user.Store?.Name,
                StoreAddress = user.Store?.Address,
                user.IsActive,
                Roles = roles,
                user.CreatedAt,
                user.UpdatedAt
            });
        }

        [HttpPut("users/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("Không tìm thấy user.");

            if (request.StoreId.HasValue)
            {
                var storeExists = await _dbContext.Stores.AnyAsync(s => s.Id == request.StoreId.Value);
                if (!storeExists)
                {
                    return BadRequest("StoreId không tồn tại.");
                }
            }

            var userRoles = await _userManager.GetRolesAsync(user);
            if (RequiresStoreAssignment(userRoles) && !request.StoreId.HasValue)
            {
                return BadRequest("Role hiện tại của user bắt buộc phải có StoreId.");
            }

            user.Email = request.Email ?? user.Email;
            user.FullName = request.FullName ?? user.FullName;
            user.StoreId = request.StoreId;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Lỗi cập nhật tài khoản: {errors}");
            }

            return Ok(new { Message = "Cập nhật user thành công." });
        }

        [HttpPatch("users/{id:guid}/lock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> LockUser(Guid id)
        {
            return await SetUserActiveStatus(id, false);
        }

        [HttpPatch("users/{id:guid}/unlock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnlockUser(Guid id)
        {
            return await SetUserActiveStatus(id, true);
        }

        private async Task<IActionResult> SetUserActiveStatus(Guid id, bool isActive)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("Không tìm thấy user.");

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest($"Không thể cập nhật trạng thái user: {errors}");
            }

            return Ok(new { Message = isActive ? "Đã mở khóa user." : "Đã khóa user." });
        }

        private List<Claim> BuildUserClaims(ApplicationUser user, IEnumerable<string> userRoles, string storeName)
        {
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.Id.ToString()),
                new Claim("LocationType", user.LocationType ?? string.Empty),
                new Claim("FullName", user.FullName ?? string.Empty),
                new Claim("StoreName", storeName)
            };

            if (user.StoreId.HasValue)
            {
                authClaims.Add(new Claim("StoreId", user.StoreId.Value.ToString()));
            }

            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            return authClaims;
        }

        private JwtSecurityToken GenerateJwtToken(List<Claim> authClaims)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JwtSettings:SecretKey is missing.");
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"])),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
            return token;
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var secretKey = _configuration["JwtSettings:SecretKey"]
                ?? throw new InvalidOperationException("JwtSettings:SecretKey is missing.");

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = false,
                ValidIssuer = _configuration["JwtSettings:Issuer"],
                ValidAudience = _configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }

        private async Task<string> IssueRefreshTokenAsync(ApplicationUser user)
        {
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

            await _userManager.SetAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenName, refreshToken);
            await _userManager.SetAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenExpiryName, refreshTokenExpiry.ToString("O"));

            return refreshToken;
        }

        private async Task RevokeRefreshTokenAsync(ApplicationUser user)
        {
            await _userManager.RemoveAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenName);
            await _userManager.RemoveAuthenticationTokenAsync(user, RefreshTokenProvider, RefreshTokenExpiryName);
        }

        private static bool RequiresStoreAssignment(string? roleName)
        {
            return string.Equals(roleName, "FranchiseStoreStaff", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(roleName, "CentralKitchenStaff", StringComparison.OrdinalIgnoreCase);
        }

        private static bool RequiresStoreAssignment(IEnumerable<string> roleNames)
        {
            return roleNames.Any(RequiresStoreAssignment);
        }

        private const string RefreshTokenProvider = "AuthService";
        private const string RefreshTokenName = "RefreshToken";
        private const string RefreshTokenExpiryName = "RefreshTokenExpiry";
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CreateUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public Guid? StoreId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? FcmToken { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public Guid? StoreId { get; set; }
    }

    public class RefreshTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
