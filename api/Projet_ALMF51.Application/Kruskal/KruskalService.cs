using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Kruskal
{
    public class KruskalService : IKruskalService
    {
        public MSTResult Compute(Graph graph)
        {
            var result = new MSTResult
            {
                Edges = new List<Edge>(),
                TotalCost = 0
            };

            var edges = graph.Edges.OrderBy(e => e.Weight).ToList();

            var parent = new Dictionary<string, string>();
            foreach (var node in graph.Nodes)
                parent[node] = node;

            foreach (var edge in edges)
            {
                var from = edge.From;
                while (parent[from] != from)
                    from = parent[from];

                var to = edge.To;
                while (parent[to] != to)
                    to = parent[to];

                if (from != to)
                {
                    result.Edges.Add(edge);
                    result.TotalCost += edge.Weight;
                    parent[to] = from;
                }
            }

            return result;
        }
    }
}
