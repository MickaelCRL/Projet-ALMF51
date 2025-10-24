using Projet_ALMF51.Domain;
using Projet_ALMF51.Domain.Results;

namespace Projet_ALMF51.Application.FloydWarshall
{
    public interface IFloydWarshallService
    {
        FloydWarshallResult Compute(Graph graph);
    }
}
