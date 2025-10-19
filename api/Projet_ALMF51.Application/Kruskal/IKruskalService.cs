using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Application.Kruskal
{
    public interface IKruskalService
    {
        KruskalResult Compute(Graph graph);
    }
}
