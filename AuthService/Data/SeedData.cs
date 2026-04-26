using Microsoft.AspNetCore.Identity;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var dbContext = serviceProvider.GetRequiredService<AuthDbContext>();
            var kitchenStoreId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var franchiseStoreId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

            if (!await dbContext.Stores.AnyAsync(s => s.Id == kitchenStoreId))
            {
                dbContext.Stores.Add(
                    new Store
                    {
                        Id = kitchenStoreId,
                        Name = "Central Kitchen 1",
                        Address = "District 1, Ho Chi Minh City"
                    }
                );
            }

            if (!await dbContext.Stores.AnyAsync(s => s.Id == franchiseStoreId))
            {
                dbContext.Stores.Add(
                    new Store
                    {
                        Id = franchiseStoreId,
                        Name = "Franchise Store 1",
                        Address = "District 3, Ho Chi Minh City"
                    }
                );
            }

            if (dbContext.ChangeTracker.HasChanges())
            {
                await dbContext.SaveChangesAsync();
            }

            
            string[] roleNames = { 
                "Admin", 
                "Manager", 
                "SupplyCoordinator", 
                "CentralKitchenStaff", 
                "FranchiseStoreStaff" 
            };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new ApplicationRole(roleName));
                }
            }

            
            if (await userManager.FindByEmailAsync("admin@system.com") == null)
            {
                var adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = "admin@system.com",
                    FullName = "Quản Trị Hệ Thống",
                    LocationType = "HQ",
                    IsActive = true
                };
                if ((await userManager.CreateAsync(adminUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            
            if (await userManager.FindByEmailAsync("manager@system.com") == null)
            {
                var managerUser = new ApplicationUser
                {
                    UserName = "manager",
                    Email = "manager@system.com",
                    FullName = "Quản Lý Vận Hành",
                    LocationType = "HQ",
                    IsActive = true
                };
                if ((await userManager.CreateAsync(managerUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(managerUser, "Manager");
                }
            }

            
            if (await userManager.FindByEmailAsync("supply@system.com") == null)
            {
                var supplyUser = new ApplicationUser
                {
                    UserName = "supply_coord",
                    Email = "supply@system.com",
                    FullName = "Điều Phối Cung Ứng",
                    LocationType = "HQ",
                    IsActive = true
                };
                if ((await userManager.CreateAsync(supplyUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(supplyUser, "SupplyCoordinator");
                }
            }

            
            if (await userManager.FindByEmailAsync("kitchen1@system.com") == null)
            {
                var kitchenUser = new ApplicationUser
                {
                    UserName = "kitchen_staff",
                    Email = "kitchen1@system.com",
                    FullName = "Nhân Viên Bếp Trung Tâm 1",
                    LocationType = "CentralKitchen",
                    StoreId = kitchenStoreId, 
                    IsActive = true
                };
                if ((await userManager.CreateAsync(kitchenUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(kitchenUser, "CentralKitchenStaff");
                }
            }

            
            if (await userManager.FindByEmailAsync("store1@system.com") == null)
            {
                var storeUser = new ApplicationUser
                {
                    UserName = "store_staff",
                    Email = "store1@system.com",
                    FullName = "Nhân Viên Cửa Hàng 1",
                    LocationType = "FranchiseStore",
                    StoreId = franchiseStoreId, 
                    IsActive = true
                };
                if ((await userManager.CreateAsync(storeUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(storeUser, "FranchiseStoreStaff");
                }
            }

            
            if (await userManager.FindByEmailAsync("test@system.com") == null)
            {
                var testUser = new ApplicationUser
                {
                    UserName = "testuser",
                    Email = "test@system.com",
                    FullName = "Test User ASCII",
                    LocationType = "HQ",
                    IsActive = true
                };
                if ((await userManager.CreateAsync(testUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(testUser, "Admin");
                }
            }
        }
    }
}
