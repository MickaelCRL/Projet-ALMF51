namespace Projet_ALMF51.Application.DFS
{
    public class DFSResult
    {
        public List<string> Order { get; set; } = new();
        public Dictionary<string, string> Parents { get; set; } = new();
    }
}
