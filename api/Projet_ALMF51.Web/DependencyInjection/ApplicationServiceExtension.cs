using Projet_ALMF51.Application.bfs;

namespace Projet_ALMF51.Web.DependencyInjection
{
    public static class ApplicationServiceExtension
    {
        public static void RegisterApplicationServices(this WebApplicationBuilder builder)
        {
            var services = builder.Services;

            services.AddTransient<IBFSServices, BFSServices>();
        }
    }
}