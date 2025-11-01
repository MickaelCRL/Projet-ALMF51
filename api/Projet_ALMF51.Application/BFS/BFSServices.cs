using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.BFS
{
    public class BFSServices : IBFSServices
    {
        public TraversalResult Compute(Graph graph, string start)
        {
            var state = new Dictionary<string, string>();
            var parents = new Dictionary<string, string>();
            var order = new List<string>();

            foreach (var x in graph.Nodes)
            {
                state[x] = "non vu";
                parents[x] = null;
            }

            int i = 0;
            int j = 0;

            if (state[start] == "non vu")
            {
                order.Add(start);
                state[start] = "vu";
                j++;

                while (i < j)
                {
                    var y = order[i];
                    i++;

                    var neighbors = graph.Edges
                        .Where(e =>
                            graph.IsOriented ? e.From == y : (e.From == y || e.To == y)
                        )
                        .Select(e => e.From == y ? e.To : e.From)
                        .OrderBy(z => z);

                    foreach (var z in neighbors)
                    {
                        if (state[z] == "non vu")
                        {
                            state[z] = "vu";
                            order.Add(z);
                            j++;
                            parents[z] = y;
                        }
                    }
                }
            }

            return new TraversalResult
            {
                Parents = parents,
                Order = order
            };
        }
    }
}