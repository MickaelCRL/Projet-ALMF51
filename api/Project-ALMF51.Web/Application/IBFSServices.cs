using Project_ALMF51.Web.Domain;

namespace Project_ALMF51.Web.Application
{
    public interface IBFSServices
    {
        Dictionary<string, string> Traverse(Graph graph, string start);
    }
}
