using AuthService.Data;
using AuthService.Models;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services
{
    public class NotificationService
    {
        private readonly AuthDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationService(AuthDbContext dbContext, UserManager<ApplicationUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        public async Task RegisterTokenAsync(Guid userId, string fcmToken)
        {
            var normalizedToken = fcmToken.Trim();
            if (string.IsNullOrWhiteSpace(normalizedToken))
            {
                throw new ArgumentException("FCM token is required.", nameof(fcmToken));
            }

            var existingRows = await _dbContext.UserDeviceTokens
                .Where(t => t.FcmToken == normalizedToken)
                .ToListAsync();

            if (existingRows.Count > 0)
            {
                foreach (var row in existingRows.Where(t => t.UserId != userId))
                {
                    row.UserId = userId;
                    row.CreatedAt = DateTime.UtcNow;
                }

                if (existingRows.Any(t => t.UserId == userId))
                {
                    await _dbContext.SaveChangesAsync();
                    return;
                }

                await _dbContext.SaveChangesAsync();
                return;
            }

            _dbContext.UserDeviceTokens.Add(new UserDeviceToken
            {
                UserId = userId,
                FcmToken = normalizedToken
            });

            await _dbContext.SaveChangesAsync();
        }

        public async Task<NotificationSendResult> SendAccountCreatedNotificationAsync(string fcmToken, string username)
        {
            return await SendToTokensAsync(
                new[] { fcmToken },
                "Hệ Thống Franchise",
                $"Tài khoản {username} của bạn đã được khởi tạo thành công.");
        }

        public async Task<NotificationSendResult> SendToRoleAsync(string roleName, string title, string body)
        {
            var users = await _userManager.GetUsersInRoleAsync(roleName);
            var userIds = users.Select(u => u.Id).ToList();

            var tokens = await _dbContext.UserDeviceTokens
                .Where(t => userIds.Contains(t.UserId))
                .Select(t => t.FcmToken)
                .Distinct()
                .ToListAsync();

            return await SendToTokensAsync(tokens, title, body);
        }

        public async Task<NotificationSendResult> SendToUserAsync(Guid userId, string title, string body)
        {
            var tokens = await _dbContext.UserDeviceTokens
                .Where(t => t.UserId == userId)
                .Select(t => t.FcmToken)
                .Distinct()
                .ToListAsync();

            return await SendToTokensAsync(tokens, title, body);
        }

        private async Task<NotificationSendResult> SendToTokensAsync(IEnumerable<string> tokens, string title, string body)
        {
            var distinctTokens = tokens
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();

            if (distinctTokens.Count == 0)
            {
                return new NotificationSendResult
                {
                    TargetTokenCount = 0,
                    SentCount = 0,
                    FailedCount = 0,
                    Message = "Không có FCM token hợp lệ để gửi."
                };
            }

            if (!IsFirebaseConfigured())
            {
                return new NotificationSendResult
                {
                    TargetTokenCount = distinctTokens.Count,
                    SentCount = 0,
                    FailedCount = distinctTokens.Count,
                    Message = "Firebase chưa được cấu hình trong AuthService."
                };
            }

            var sentCount = 0;
            var failedCount = 0;

            foreach (var token in distinctTokens)
            {
                var message = new Message
                {
                    Token = token,
                    Notification = new Notification
                    {
                        Title = title,
                        Body = body
                    }
                };

                try
                {
                    await FirebaseMessaging.DefaultInstance.SendAsync(message);
                    sentCount++;
                }
                catch (Exception)
                {
                    failedCount++;
                }
            }

            return new NotificationSendResult
            {
                TargetTokenCount = distinctTokens.Count,
                SentCount = sentCount,
                FailedCount = failedCount,
                Message = failedCount == 0
                    ? "Gửi notification thành công."
                    : "Đã gửi notification nhưng có một số token thất bại."
            };
        }

        private static bool IsFirebaseConfigured()
        {
            try
            {
                _ = FirebaseApp.DefaultInstance;
                return true;
            }
            catch (InvalidOperationException)
            {
                return false;
            }
        }
    }

    public class NotificationSendResult
    {
        public int TargetTokenCount { get; set; }
        public int SentCount { get; set; }
        public int FailedCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
