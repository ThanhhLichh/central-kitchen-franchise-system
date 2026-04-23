using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using AuthService.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình SQL Server
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Cấu hình Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<AuthDbContext>()
    .AddDefaultTokenProviders();

// 3. Cấu hình Redis Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisCache");
});

// 4. Khởi tạo Firebase
if (File.Exists("firebase-adminsdk.json"))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromFile("firebase-adminsdk.json") 
    });
}

// 5. Đăng ký Services & Memory Cache
builder.Services.AddMemoryCache();
builder.Services.AddScoped<TokenCacheService>();
builder.Services.AddScoped<NotificationService>();

// 6. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtSecret = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey is missing.");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<AuthDbContext>();
        db.Database.Migrate(); 
        Console.WriteLine("----> Database đã được cập nhật thành công!");

        await SeedData.InitializeAsync(services);
        Console.WriteLine("----> Đã tạo thành công 5 Roles và 5 Tài khoản mẫu!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"----> LỖI KHI KHỞI TẠO: {ex.Message}");
    }
}

app.UseMiddleware<TokenBlacklistMiddleware>();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
