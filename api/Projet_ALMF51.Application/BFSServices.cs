using Project_ALMF51.Application;
using Project_ALMF51.Domain;

namespace Project_ALMF51.Web.Services
{
    public class BFSServices : IBFSServices
    {
        public Dictionary<string, string> Traverse(Graph graph, string start)
        {
            var state = new Dictionary<string, string>();
            var parent = new Dictionary<string, string>();
            var queue = new List<string>();

            foreach (var x in graph.Nodes)
            {
                state[x] = "non vu";
                parent[x] = null;
            }

            int i = 0;
            int j = 0;

            if (state[start] == "non vu")
            {
                queue.Add(start);
                state[start] = "vu";
                j++;

                while (i < j)
                {
                    var y = queue[i];
                    i++;

                    // Pour chaque successeur de y
                    var voisins = graph.Edges
                        .Where(e => e.From == y)
                        .Select(e => e.To);

                    foreach (var z in voisins)
                    {
                        if (state[z] == "non vu")
                        {
                            state[z] = "vu";
                            queue.Add(z);
                            j++;
                            parent[z] = y;
                        }
                    }
                }
            }

            return parent;
        }
    }
}