using Projet_ALMF51.Domain;

namespace Projet_ALMF51.Presentation.Dijkstra
{
    public class DijkstraRequest
    {
        public Graph Graph { get; set; }
        public string Start { get; set; }
        public string Target { get; set; }
    }
}
