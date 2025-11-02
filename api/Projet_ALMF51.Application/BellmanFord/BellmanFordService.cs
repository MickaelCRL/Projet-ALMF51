using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;
using System.Collections.Generic;

namespace Projet_ALMF51.Application.BellmanFord
{
    public class BellmanFordService : IBellmanFordService
    {
        private const long INF = long.MaxValue / 4; // grande sentinelle, évite overflow

        public OptimalPathResult Compute(Graph graph, string start, string target)
        {
            // Distances & parents
            var dist = new Dictionary<string, long>();
            var parent = new Dictionary<string, string?>();

            foreach (var node in graph.Nodes)
            {
                dist[node] = INF;
                parent[node] = null;
            }
            dist[start] = 0;

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

            // Chemin introuvable ?
            if (dist[target] == INF)
            {
                return new OptimalPathResult
                {
                    Path = new List<string>(),
                    TotalCost = int.MaxValue
                };
            }

            // Reconstruction du chemin target -> start
            var path = new List<string>();
            string? cur = target;
            var guard = new HashSet<string>();
            while (cur != null && !guard.Contains(cur))
            {
                guard.Add(cur);
                path.Add(cur);
                cur = parent[cur];
            }

            path.Reverse();

            return new OptimalPathResult
            {
                Path = path,
                TotalCost = (int)dist[target] // si tu as de gros poids, fais TotalCost en long
                // HasNegativeCycle = false
            };
        }
    }
}
