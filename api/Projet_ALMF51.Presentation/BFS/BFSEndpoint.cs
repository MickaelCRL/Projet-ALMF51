using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.BFS;

namespace Projet_ALMF51.Presentation.bfs
{
    public static class BFSEndpoint
    {
        public const string BFSRoute = "/bfs";

        public static void MapBFSEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(BFSRoute, (GraphTraversalRequest request, IBFSServices bfs) =>
            {
                var result = bfs.Compute(request.Graph, request.Start);
                return Results.Ok(result);
            });

        }
    }
}
