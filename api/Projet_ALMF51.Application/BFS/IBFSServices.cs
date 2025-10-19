using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.BFS
{
    public interface IBFSServices
    {
        TraversalResult Compute(Graph graph, string start);
    }
}