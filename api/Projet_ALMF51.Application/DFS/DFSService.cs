using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.DFS
{
    public class DFSService : IDFSService
    {
        public DFSResult Traverse(Graph graph, string start)
        {
            var result = new DFSResult();
            var visited = new HashSet<string>();

            var adjacencyList = BuildAdjacencyList(graph);

            DFSRecursive(start, visited, result, adjacencyList, null);

            return result;
        }

        private void DFSRecursive(
            string current,
            HashSet<string> visited,
            DFSResult result,
            Dictionary<string, List<string>> adjacencyList,
            string parent
        )
        {
            visited.Add(current);
            result.Order.Add(current);
            result.Parents[current] = parent;

            if (adjacencyList.ContainsKey(current))
            {
                foreach (var neighbor in adjacencyList[current])
                {
                    if (!visited.Contains(neighbor))
                    {
                        DFSRecursive(neighbor, visited, result, adjacencyList, current);
                    }
                }
            }
        }

        private Dictionary<string, List<string>> BuildAdjacencyList(Graph graph)
        {
            var adjacencyList = new Dictionary<string, List<string>>();

            foreach (var node in graph.Nodes)
            {
                adjacencyList[node] = new List<string>();
            }

            foreach (var edge in graph.Edges)
            {
                if (!adjacencyList[edge.From].Contains(edge.To))
                    adjacencyList[edge.From].Add(edge.To);

                if (!adjacencyList[edge.To].Contains(edge.From))
                    adjacencyList[edge.To].Add(edge.From);
            }

            foreach (var key in adjacencyList.Keys.ToList())
            {
                adjacencyList[key] = adjacencyList[key].OrderBy(n => n).ToList();
            }

            return adjacencyList;
        }
    }
}
