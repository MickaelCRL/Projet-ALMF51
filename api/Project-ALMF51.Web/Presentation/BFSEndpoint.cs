using Project_ALMF51.Web.Application;
using Project_ALMF51.Web.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Project_ALMF51.Web.Presentation
{
    public static class BFSEndpoint
    {
        public const string BFSRoute = "/bfs";

        public static void MapBFSEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(BFSRoute, ([FromBody] BFSRequest request, IBFSServices bfs) =>
            {
                var result = bfs.Traverse(request.Graph, request.Start);
                return Results.Ok(result);
            });

        }
    }
}
