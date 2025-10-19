using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.DFS
{
    public interface IDFSService
    {
        TraversalResult Compute(Graph graph, string start);
    }
}
