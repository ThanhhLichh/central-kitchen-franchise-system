using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuthService.Data;
using AuthService.Models;

namespace AuthService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoresController : ControllerBase
    {
        private readonly AuthDbContext _dbContext;

        public StoresController(AuthDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetStores()
        {
            var stores = await _dbContext.Stores
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Address
                })
                .ToListAsync();

            return Ok(stores);
        }

        [HttpPost]
        public async Task<IActionResult> CreateStore([FromBody] CreateStoreRequest request)
        {
            var newStore = new Store
            {
                Name = request.Name,
                Address = request.Address
            };

            _dbContext.Stores.Add(newStore);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                newStore.Id,
                newStore.Name,
                newStore.Address
            });
        }
    }

    public class CreateStoreRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}
