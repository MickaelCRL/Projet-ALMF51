using Projet_ALMF51.Application.BellmanFord;
using Projet_ALMF51.Application.BFS;
using Projet_ALMF51.Application.DFS;
using Projet_ALMF51.Application.Dijkstra;
using Projet_ALMF51.Application.FloydWarshall;
using Projet_ALMF51.Application.Kruskal;
using Projet_ALMF51.Application.Prim;

namespace Projet_ALMF51.Web.DependencyInjection
{
    public static class ApplicationServiceExtension
    {
        public static void RegisterApplicationServices(this WebApplicationBuilder builder)
        {
            var services = builder.Services;

            services.AddTransient<IBFSServices, BFSServices>();
            services.AddTransient<IDFSService, DFSService>();
            services.AddTransient<IKruskalService, KruskalService>();
            services.AddTransient<IPrimService, PrimService>();
            services.AddTransient<IDijkstraService, DijkstraService>();
            services.AddTransient<IBellmanFordService, BellmanFordService>();
            services.AddTransient<IFloydWarshallService, FloydWarshallService>();
        }
    }
}