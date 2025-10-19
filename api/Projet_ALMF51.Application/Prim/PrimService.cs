using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Prim
{
    public class PrimService : IPrimService
    {
        public MSTResult Compute(Graph graph, string startNode)
        {
            var result = new MSTResult
            {
                Edges = new List<Edge>(),
                TotalCost = 0
            };

            var visited = new HashSet<string>
            {
                startNode
            };

            while (visited.Count < graph.Nodes.Count)
            {
                Edge minEdge = null;

                foreach (var edge in graph.Edges)
                {
                    bool fromVisited = visited.Contains(edge.From);
                    bool toVisited = visited.Contains(edge.To);

                    if (fromVisited && !toVisited || !fromVisited && toVisited)
                    {
                        if (minEdge == null || edge.Weight < minEdge.Weight)
                            minEdge = edge;
                    }
                }

                if (minEdge == null)
                    break;

                result.Edges.Add(minEdge);
                result.TotalCost += minEdge.Weight;

                visited.Add(visited.Contains(minEdge.From) ? minEdge.To : minEdge.From);
            }

            return result;
        }
    }
}
