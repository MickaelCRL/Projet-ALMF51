using Projet_ALMF51.Application.Kruskal;
using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Prim
{
    public interface IPrimService
    {
        MSTResult Compute(Graph graph, string startNode);
    }
}
