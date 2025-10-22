using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.Dijkstra;

namespace Projet_ALMF51.Presentation.Dijkstra
{
    public static class DijkstraEndpoint
    {
        public const string DijkstraRoute = "/dijkstra";

        public static void MapDijkstraEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(DijkstraRoute, (OptimalPathRequest request, IDijkstraService dijkstra) =>
            {
                var result = dijkstra.Compute(request.Graph, request.Start, request.Target);
                return Results.Ok(result);

            });
        }
    }
}
