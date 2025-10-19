using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.BFS
{
    public interface IBFSServices
    {
        BFSResult Compute(Graph graph, string start);
    }
}