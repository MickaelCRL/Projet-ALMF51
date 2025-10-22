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
            parents[start] = null;

            var queue = new Queue<string>();
            queue.Enqueue(start);

            while (queue.Count > 0)
            {
                var t = queue.Dequeue();

                foreach (var edge in graph.Edges)
                {
                    if (edge.From == t)
                    {
                        var k = edge.To;
                        var newDistance = distances[t] + edge.Weight;

                        if (newDistance < distances[k])
                        {
                            distances[k] = newDistance;
                            parents[k] = t;

                            queue.Enqueue(k);
                        }
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
