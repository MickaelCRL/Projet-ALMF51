using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Projet_ALMF51.Application.Prim;

namespace Projet_ALMF51.Presentation.Prim
{
    public static class PrimEndpoint
    {
        public static void MapPrimEndpoint(this IEndpointRouteBuilder app) 
        {
            app.MapPost("/prim", (GraphTraversalRequest request, IPrimService prim) =>
            {
                var result = prim.Compute(request.Graph, request.Start);
                return Results.Ok(result);
            });
        }
    }
}
