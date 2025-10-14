using Project_ALMF51.Web.Application;
using Project_ALMF51.Web.Domain;

namespace Project_ALMF51.Web.Presentation
{
    public static class BFSEndpoint
    {
        public const string BFSRoute = "/bfs";

        public static void MapBFSEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(BFSRoute, (Graph graph, string start, IBFSServices bfs) =>
            {
                var result = bfs.Traverse(graph, start);
                return Results.Ok(result);
            });

        }
    }
}
