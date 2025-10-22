namespace Projet_ALMF51.Domain.Results
{
    public class OptimalPathResult
    {
        public List<string> Path { get; set; } = new();
        public int TotalCost { get; set; }
    }
}
