using Microsoft.AspNetCore.Identity;
using AuthService.Models;

namespace AuthService.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            
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
                    StoreId = Guid.NewGuid(), 
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
                    StoreId = Guid.NewGuid(), 
                    IsActive = true
                };
                if ((await userManager.CreateAsync(storeUser, "Password@123")).Succeeded)
                {
                    await userManager.AddToRoleAsync(storeUser, "FranchiseStoreStaff");
                }
            }
        }
    }
}