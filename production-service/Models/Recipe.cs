using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductionService.Models
{
    public class Recipe
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int IngredientId { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Quantity { get; set; }
    }
}