using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.FloydWarshall
{
    public class FloydWarshallService : IFloydWarshallService
    {
        public FloydWarshallResult Compute(Graph graph)
        {
            var nodes = graph.Nodes.ToList();
            int n = nodes.Count;

            const long INF = long.MaxValue / 4;

            var dist = new long[n, n];
            var next = new string?[n, n];

            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < n; j++)
                {
                    dist[i, j] = (i == j) ? 0 : INF;
                    next[i, j] = null;
                }
            }

            foreach (var edge in graph.Edges)
            {
                int u = nodes.IndexOf(edge.From);
                int v = nodes.IndexOf(edge.To);

                dist[u, v] = Math.Min(dist[u, v], edge.Weight);
                next[u, v] = nodes[v];

                if (!graph.IsOriented)
                {
                    dist[v, u] = Math.Min(dist[v, u], edge.Weight);
                    next[v, u] = nodes[u];
                }
            }

            for (int k = 0; k < n; k++)
            {
                for (int i = 0; i < n; i++)
                {
                    for (int j = 0; j < n; j++)
                    {
                        if (dist[i, k] < INF && dist[k, j] < INF)
                        {
                            long newDist = dist[i, k] + dist[k, j];
                            if (newDist < dist[i, j])
                            {
                                dist[i, j] = newDist;
                                next[i, j] = next[i, k];
                            }
                        }
                    }
                }
            }

            var distJagged = new long[n][];
            var nextJagged = new string?[n][];

            for (int i = 0; i < n; i++)
            {
                distJagged[i] = new long[n];
                nextJagged[i] = new string?[n];

                for (int j = 0; j < n; j++)
                {
                    distJagged[i][j] = dist[i, j];
                    nextJagged[i][j] = next[i, j];
                }
            }

            return new FloydWarshallResult
            {
                Distances = distJagged,
                Next = nextJagged,
                Nodes = nodes
            };
        }
    }
}
