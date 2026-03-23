using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// 3 DÒNG NÀY CHÍNH LÀ CHÌA KHÓA ĐỂ HẾT LỖI ĐỎ:
using ProductionService.Models;
using ProductionService.DTOs;
using ProductionService.Data;

namespace ProductionService.Controllers
{
    [ApiController]
    public class ProductionController : ControllerBase
    {
        private readonly ProductionDbContext _context;

        public ProductionController(ProductionDbContext context) => _context = context;

        // GET: /production-plan
        [HttpGet("production-plan")]
        public async Task<IActionResult> GetProductionPlans([FromQuery] string? status, [FromQuery] int? productId)
        {
            var query = _context.ProductionPlans.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(p => p.Status == status.ToLower());

            if (productId.HasValue)
                query = query.Where(p => p.ProductId == productId.Value);

            var plans = await query.ToListAsync();  
            return Ok(plans);
        }

        // POST: /production-plan
        [HttpPost("production-plan")]
        public async Task<IActionResult> CreatePlan([FromBody] CreatePlanRequest request)
        {
            if (request.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0." });

            var newPlan = new ProductionPlan
            {
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                Status = PlanStatus.Pending.ToString().ToLower()
            };

            _context.ProductionPlans.Add(newPlan);
            await _context.SaveChangesAsync();

            return Created($"/production-plan/{newPlan.Id}", new
            {
                id = newPlan.Id,
                productId = newPlan.ProductId,
                quantity = newPlan.Quantity,
                status = newPlan.Status,
                message = "Production plan created successfully."
            });
        }

        // PUT: /production-status
        [HttpPut("production-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusRequest request)
        {
            // TỐI ƯU: Chỉ tìm database 1 lần duy nhất thay vì 6 lần
            var plan = await _context.ProductionPlans.FindAsync(request.Id);

            if (plan == null)
                return NotFound(new { message = "Production plan not found." });

            string currentStatus = plan.Status.ToLower();
            string newStatus = request.Status.ToLower();

            // Logic State Machine: Kiểm tra chuyển đổi trạng thái hợp lệ
            bool isValidTransition = false;

            if (currentStatus == "pending" && newStatus == "processing")
            {
                isValidTransition = true;
                // TO-DO (Tương lai): Gọi Inventory Service để kiểm tra/trừ nguyên liệu kho
            }
            else if (currentStatus == "processing" && newStatus == "done")
            {
                isValidTransition = true;
                // TO-DO (Tương lai): Gọi Inventory Service để cộng thành phẩm vào kho
            }

            if (!isValidTransition)
            {
                return BadRequest(new
                {
                    message = $"Invalid status transition from '{currentStatus}' to '{newStatus}'."
                });
            }

            // Cập nhật trạng thái
            plan.Status = newStatus;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = plan.Id,
                status = plan.Status,
                message = "Status updated successfully."
            });
        }
    }
}