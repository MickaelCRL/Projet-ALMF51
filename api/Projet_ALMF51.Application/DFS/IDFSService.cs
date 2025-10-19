using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.DFS
{
    public interface IDFSService
    {
        DFSResult Compute(Graph graph, string start);
    }
}
