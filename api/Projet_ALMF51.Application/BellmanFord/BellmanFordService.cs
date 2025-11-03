using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;
using System.Collections.Generic;

namespace Projet_ALMF51.Application.BellmanFord
{
    public class BellmanFordService : IBellmanFordService
    {
        const int INFINITY = int.MaxValue;
        public BellmanFordResult Compute(Graph graph, string start)
        {
            var distances = new Dictionary<string, int>();
            var parents = new Dictionary<string, string>();
            var L = new HashSet<string>();

            foreach (var node in graph.Nodes)
            {
                distances[node] = INFINITY;
                parents[node] = null;
            }
            distances[start] = 0;

            distances[start] = 0;
            parents[start] = null;
            L.Add(start);

            while (L.Count > 0)
            {
                string t = L.First();
                L.Remove(t);

                foreach (var edge in graph.GetOutgoingEdges(t))
                {
                    string k = edge.To;
                    int w = edge.Weight;

                    if (distances[k] > distances[t] + w)
                    {
                        distances[k] = distances[t] + w;
                        parents[k] = t;
                        L.Add(k);
                    }
                }
            }

            return new BellmanFordResult(distances, parents);
          
        }
    }
}

