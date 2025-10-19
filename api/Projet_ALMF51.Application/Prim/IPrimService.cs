using Projet_ALMF51.Application.Kruskal;
using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.Prim
{
    public interface IPrimService
    {
        PrimResult Compute(Graph graph, string startNode);
    }
}
