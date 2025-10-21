namespace Projet_ALMF51.Domain.Results
{
    public class DijkstraResult
    {
        public List<string> Path { get; set; } = new();
        public int TotalCost { get; set; }
    }
}
