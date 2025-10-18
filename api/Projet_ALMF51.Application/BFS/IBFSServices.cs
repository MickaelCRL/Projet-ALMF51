using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.bfs
{
    public interface IBFSServices
    {
        BFSResult Traverse(Graph graph, string start);
    }
}