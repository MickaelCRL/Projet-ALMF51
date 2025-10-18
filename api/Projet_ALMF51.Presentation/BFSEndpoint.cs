using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Project_ALMF51.Application;
using Projet_ALMF51.Presentation;

namespace Project_ALMF51.Presentation
{
    public static class BFSEndpoint
    {
        public const string BFSRoute = "/bfs";

        public static void MapBFSEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(BFSRoute, (BFSRequest request, IBFSServices bfs) =>
            {
                var result = bfs.Traverse(request.Graph, request.Start);
                return Results.Ok(result);
            });

        }
    }
}
