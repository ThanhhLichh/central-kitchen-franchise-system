using Microsoft.EntityFrameworkCore;
using ProductionService.Models;

namespace ProductionService.Data
{
    public class ProductionDbContext : DbContext
    {
        public ProductionDbContext(DbContextOptions<ProductionDbContext> options) : base(options) { }

        public DbSet<ProductionPlan> ProductionPlans { get; set; }
        public DbSet<Recipe> Recipes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tự động thêm vài công thức mẫu vào Database khi khởi tạo
            modelBuilder.Entity<Recipe>().HasData(
                new Recipe { Id = 1, ProductId = 101, IngredientId = 201, Quantity = 5.50m },
                new Recipe { Id = 2, ProductId = 101, IngredientId = 202, Quantity = 2.00m },
                new Recipe { Id = 3, ProductId = 102, IngredientId = 203, Quantity = 10.00m }
            );
        }
    }
}