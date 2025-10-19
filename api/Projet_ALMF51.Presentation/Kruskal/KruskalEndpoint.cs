using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.Kruskal;
using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Presentation.Kruskal
{
    public static class KruskalEndpoint
    {
        public static void MapKruskalEndpoints(this IEndpointRouteBuilder app)
        {
            app.MapPost("/kruskal", (Graph graph, IKruskalService kruskal) =>
            {
                var result = kruskal.ComputeMST(graph);
                return Results.Ok(result);
            });
        }
    }
}
