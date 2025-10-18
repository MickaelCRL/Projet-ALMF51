using Project_ALMF51.Domain;

namespace Project_ALMF51.Application
{
    public interface IBFSServices
    {
        Dictionary<string, string> Traverse(Graph graph, string start);
    }
}