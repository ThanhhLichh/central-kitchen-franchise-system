using Microsoft.EntityFrameworkCore;
using ProductionService.Data;

var builder = WebApplication.CreateBuilder(args);

// =====================================================================
// LẤY CHUỖI KẾT NỐI VÀ ĐĂNG KÝ MYSQL DATABASE Ở ĐÂY
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Đã sửa thành MySqlServerVersion cố định để không bị lỗi AutoDetect:
builder.Services.AddDbContext<ProductionDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30))));
// =====================================================================

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();