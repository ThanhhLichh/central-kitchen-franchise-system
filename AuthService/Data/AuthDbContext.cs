using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AuthService.Models;

namespace AuthService.Data
{
    public class AuthDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }
        public DbSet<Store> Stores => Set<Store>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            var adminRoleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var managerRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var centralKitchenRoleId = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var storeStaffRoleId = Guid.Parse("44444444-4444-4444-4444-444444444444");
            var supplyCoordRoleId = Guid.Parse("55555555-5555-5555-5555-555555555555");

            builder.Entity<ApplicationRole>().HasData(
                new ApplicationRole { Id = adminRoleId, Name = "Admin", NormalizedName = "ADMIN" },
                new ApplicationRole { Id = managerRoleId, Name = "Manager", NormalizedName = "MANAGER" },
                new ApplicationRole { Id = centralKitchenRoleId, Name = "CentralKitchenStaff", NormalizedName = "CENTRALKITCHENSTAFF" },
                new ApplicationRole { Id = storeStaffRoleId, Name = "FranchiseStoreStaff", NormalizedName = "FRANCHISESTORESTAFF" },
                new ApplicationRole { Id = supplyCoordRoleId, Name = "SupplyCoordinator", NormalizedName = "SUPPLYCOORDINATOR" }
            );

            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Store)
                .WithMany()
                .HasForeignKey(u => u.StoreId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}