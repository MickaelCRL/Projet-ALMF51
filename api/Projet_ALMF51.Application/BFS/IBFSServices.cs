using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.BFS
{
    public interface IBFSServices
    {
        BFSResult Traverse(Graph graph, string start);
    }
}