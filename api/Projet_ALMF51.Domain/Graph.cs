namespace Projet_ALMF51.Domain
{
    public class Graph
    {
        public List<string> Nodes { get; set; }
        public List<Edge> Edges { get; set; }
        public bool IsOriented { get; }
        public IEnumerable<Edge> GetOutgoingEdges(string node)
        {
            return Edges.Where(e => e.From == node);
        }
    }
}