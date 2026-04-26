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
using Microsoft.Data.SqlClient;

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
    options.Configuration = builder.Configuration.GetConnectionString("RedisCache")
        ?? builder.Configuration.GetConnectionString("Redis")
        ?? throw new InvalidOperationException("Redis connection string is missing.");
});

// 4. Khởi tạo Firebase
var firebaseCredentialsPath = Path.Combine(builder.Environment.ContentRootPath, "firebase-adminsdk.json");
if (File.Exists(firebaseCredentialsPath))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = CredentialFactory
            .FromFile<ServiceAccountCredential>(firebaseCredentialsPath)
            .ToGoogleCredential()
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
builder.Services.AddOpenApi();
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<AuthDbContext>();
        await EnsureStoresMigrationForLegacyDatabaseAsync(db);
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

static async Task EnsureStoresMigrationForLegacyDatabaseAsync(AuthDbContext db)
{
    const string storesTableCheckSql = "SELECT COUNT(1) FROM sys.tables WHERE name = 'Stores';";
    var connection = (SqlConnection)db.Database.GetDbConnection();

    if (connection.State != System.Data.ConnectionState.Open)
    {
        await connection.OpenAsync();
    }

    await using var command = connection.CreateCommand();
    command.CommandText = storesTableCheckSql;
    var storesTableExists = Convert.ToInt32(await command.ExecuteScalarAsync()) > 0;
    if (storesTableExists)
    {
        return;
    }

    var ensureStoresMigrationSql = """
        IF OBJECT_ID(N'[Stores]') IS NULL
        BEGIN
            CREATE TABLE [Stores] (
                [Id] uniqueidentifier NOT NULL,
                [Name] nvarchar(max) NOT NULL,
                [Address] nvarchar(max) NOT NULL,
                CONSTRAINT [PK_Stores] PRIMARY KEY ([Id])
            );
        END;

        INSERT INTO [Stores] ([Id], [Name], [Address])
        SELECT DISTINCT [u].[StoreId],
               CONCAT(N'Legacy Store ', CONVERT(nvarchar(36), [u].[StoreId])),
               N'Migrated placeholder'
        FROM [AspNetUsers] AS [u]
        WHERE [u].[StoreId] IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM [Stores] AS [s]
              WHERE [s].[Id] = [u].[StoreId]
          );

        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'IX_AspNetUsers_StoreId'
              AND object_id = OBJECT_ID(N'[AspNetUsers]')
        )
        BEGIN
            CREATE INDEX [IX_AspNetUsers_StoreId] ON [AspNetUsers] ([StoreId]);
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM sys.foreign_keys
            WHERE name = 'FK_AspNetUsers_Stores_StoreId'
        )
        BEGIN
            ALTER TABLE [AspNetUsers]
            ADD CONSTRAINT [FK_AspNetUsers_Stores_StoreId]
            FOREIGN KEY ([StoreId]) REFERENCES [Stores] ([Id]) ON DELETE SET NULL;
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM [__EFMigrationsHistory]
            WHERE [MigrationId] = N'20260419165234_AddStoresTable'
        )
        BEGIN
            INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
            VALUES (N'20260419165234_AddStoresTable', N'9.0.0');
        END;
        """;

    await db.Database.ExecuteSqlRawAsync(ensureStoresMigrationSql);
}
