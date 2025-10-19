using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.DFS;

namespace Projet_ALMF51.Presentation.DFS
{
    public static class DFSEndpoint
    {
        public const string DFSRoute = "/dfs";

        public static void MapDFSEndpoint(this IEndpointRouteBuilder app)
        {
            app.MapPost(DFSRoute, (GraphTraversalRequest request, IDFSService dfs) =>
            {
                var result = dfs.Traverse(request.Graph, request.Start);
                Console.WriteLine("on est la " + result);
                return Results.Ok(result);
            });
        }
    }
}
