using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Dijkstra
{
    public class DijkstraService : IDijkstraService
    {
        public OptimalPathResult Compute(Graph graph, string start, string target)
        {
            var distances = new Dictionary<string, int>();
            var parents = new Dictionary<string, string>();
            var visited = new HashSet<string>();

            foreach (var node in graph.Nodes)
                distances[node] = int.MaxValue;

            distances[start] = 0;

            var pq = new PriorityQueue<string, int>();
            pq.Enqueue(start, 0);

            while (pq.Count > 0)
            {
                var current = pq.Dequeue();

                if (visited.Contains(current))
                    continue;

                visited.Add(current);

                if (current == target)
                    break;

                var neighbors = graph.Edges
                    .Where(e => e.From == current || e.To == current);

                foreach (var edge in neighbors)
                {
                    var neighbor = edge.From == current ? edge.To : edge.From;
                    if (visited.Contains(neighbor))
                        continue;

                    int newDistance = distances[current] + edge.Weight;

                    if (newDistance < distances[neighbor])
                    {
                        distances[neighbor] = newDistance;
                        parents[neighbor] = current;
                        pq.Enqueue(neighbor, newDistance);
                    }
                }
            }

            var path = new List<string>();
            var nodePath = target;

            if (!parents.ContainsKey(target) && start != target)
            {
                return new OptimalPathResult
                {
                    Path = new List<string>(),
                    TotalCost = int.MaxValue
                };
            }

            while (nodePath != null)
            {
                path.Add(nodePath);
                parents.TryGetValue(nodePath, out nodePath);
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
