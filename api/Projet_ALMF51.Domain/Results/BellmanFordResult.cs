namespace Projet_ALMF51.Domain.Results
{
    public class BellmanFordResult
    {
        public Dictionary<string, double> Distances { get; }
        public Dictionary<string, string?> Parents { get; }

        public BellmanFordResult(Dictionary<string, double> distances, Dictionary<string, string?> parents)
        {
            Distances = distances;
            Parents = parents;
        }
    }
}
