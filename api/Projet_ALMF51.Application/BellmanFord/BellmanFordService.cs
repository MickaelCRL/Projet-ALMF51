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

            // Adjacence (tient compte du sens du graphe)
            var adj = new Dictionary<string, List<(string to, int w)>>();
            foreach (var node in graph.Nodes)
                adj[node] = new List<(string to, int w)>();

            foreach (var e in graph.Edges)
            {
                adj[e.From].Add((e.To, e.Weight));
                if (!graph.IsOriented)
                    adj[e.To].Add((e.From, e.Weight));
            }

            // SPFA + détection de cycle négatif (compte des relaxations)
            var q = new Queue<string>();
            var inQueue = new HashSet<string>();
            var relaxCount = new Dictionary<string, int>();

            q.Enqueue(start);
            inQueue.Add(start);
            relaxCount[start] = 0;

            while (q.Count > 0)
            {
                var u = q.Dequeue();
                inQueue.Remove(u);

                foreach (var (v, w) in adj[u])
                {
                    if (dist[u] == INF) continue;          // évite addition INF + w
                    var cand = dist[u] + w;
                    if (cand < dist[v])
                    {
                        dist[v] = cand;
                        parent[v] = u;

                        // détection de cycle négatif via nombre de relaxations
                        if (!relaxCount.ContainsKey(v)) relaxCount[v] = 0;
                        relaxCount[v]++;
                        if (relaxCount[v] >= graph.Nodes.Count)
                        {
                            // Cycle négatif détecté
                            return new OptimalPathResult
                            {
                                Path = new List<string>(),
                                TotalCost = int.MaxValue,   // ou null si tu préfères
                                // HasNegativeCycle = true   // <-- ajoute ce champ si possible
                            };
                        }

                        if (!inQueue.Contains(v))
                        {
                            q.Enqueue(v);
                            inQueue.Add(v);
                        }
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
