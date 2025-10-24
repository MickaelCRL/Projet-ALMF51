namespace Projet_ALMF51.Domain.Results
{
    public class FloydWarshallResult
    {
        public long[][] Distances { get; set; }
        public string[][] Next { get; set; }
        public List<string> Nodes { get; set; }
    }
}
