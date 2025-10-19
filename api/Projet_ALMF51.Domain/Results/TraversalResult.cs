namespace Projet_ALMF51.Domain.Results
{
    public class TraversalResult
    {
        public List<string> Order { get; set; } = new();
        public Dictionary<string, string> Parents { get; set; } = new();
    }
}
