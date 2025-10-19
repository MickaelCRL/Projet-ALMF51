using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Kruskal
{
    public interface IKruskalService
    {
        MSTResult Compute(Graph graph);
    }
}
