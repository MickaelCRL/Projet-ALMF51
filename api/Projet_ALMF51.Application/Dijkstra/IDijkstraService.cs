using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.Dijkstra
{
    public interface IDijkstraService
    {
        DijkstraResult Compute(Graph graph, string start, string target);
    }
}
