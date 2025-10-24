using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.FloydWarshall;
using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Presentation.FloydWarshall
{
    public static class FloydWarshallEndpoint
    {
        public const string FloydWarshallRoute = "/floyd-warshall";
        public static void MapFloydWarshallEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(FloydWarshallRoute, (Graph graph, IFloydWarshallService floydWarshall) =>
            {
                    var result = floydWarshall.Compute(graph);
                    return Results.Ok(result);
            });
        }
    }
}
