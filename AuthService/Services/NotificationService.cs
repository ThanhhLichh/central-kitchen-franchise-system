using FirebaseAdmin.Messaging;

namespace AuthService.Services
{
    public class NotificationService
    {
        public async Task SendAccountCreatedNotificationAsync(string fcmToken, string username)
        {
            if (string.IsNullOrEmpty(fcmToken)) return;

            var message = new Message()
            {
                Token = fcmToken,
                Notification = new Notification
                {
                    Title = "Hệ Thống Franchise",
                    Body = $"Tài khoản {username} của bạn đã được khởi tạo thành công."
                }
            };

            await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
    }
}