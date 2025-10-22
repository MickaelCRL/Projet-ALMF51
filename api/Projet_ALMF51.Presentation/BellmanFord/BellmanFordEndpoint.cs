using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.BellmanFord;

namespace Projet_ALMF51.Presentation.BellmanFord
{
    public static class BellmanFordEndpoint
    {
        public const string BellmanFordRoute = "/bellman-ford";
        public static void MapEndpointBellmanFord(this IEndpointRouteBuilder app)
        {
            app.MapPost(BellmanFordRoute, (OptimalPathRequest request, IBellmanFordService bellmanFord) =>
            {
                var result = bellmanFord.Compute(request.Graph, request.Start, request.Target);
                return Results.Ok(result);
            });

        }
    }
}
