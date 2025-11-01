using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.BellmanFord
{
    public class BellmanFordService : IBellmanFordService
    {
        public OptimalPathResult Compute(Graph graph, string start, string target)
        {
            var distances = new Dictionary<string, int>();
            var parents = new Dictionary<string, string>();

            foreach (var node in graph.Nodes)
            {
                distances[node] = int.MaxValue;
                parents[node] = null;
            }

            distances[start] = 0;

            int verticesCount = graph.Nodes.Count;

            for (int i = 0; i < verticesCount - 1; i++)
            {
                foreach (var edge in graph.Edges)
                {
                    RelaxEdge(edge.From, edge.To, edge.Weight);

                    if (!graph.IsOriented)
                    {
                        RelaxEdge(edge.To, edge.From, edge.Weight);
                    }
                }
            }

            void RelaxEdge(string from, string to, int weight)
            {
                if (distances[from] != int.MaxValue)
                {
                    int newDistance = distances[from] + weight;
                    if (newDistance < distances[to])
                    {
                        distances[to] = newDistance;
                        parents[to] = from;
                    }
                }
            }

            var path = new List<string>();
            var current = target;

            if (distances[target] == int.MaxValue)
            {
                return new OptimalPathResult
                {
                    Path = new List<string>(),
                    TotalCost = int.MaxValue
                };
            }

            while (current != null)
            {
                path.Add(current);
                current = parents[current];
            }

            path.Reverse();

            return new OptimalPathResult
            {
                Path = path,
                TotalCost = distances[target]
            };
        }
    }
}
