namespace ProductionService.DTOs
{
    public class CreatePlanRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateStatusRequest
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}