import useSWR from "swr";
import Header from "./components/Header";
import GraphNode from "./components/GraphNode";
import { Container, Box, Typography } from "@mui/material";
import { getBFSAsync } from "./services/bfsService";
import type { Graph } from "./models/Graph";
import type { Node } from "./models/Node";

function App() {
  const start: Node = { name: "Rennes" };

  const franceGraph: Graph = {
    nodes: [
      { name: "Rennes" },
      { name: "Nantes" },
      { name: "Bordeaux" },
      { name: "Caen" },
      { name: "Paris" },
      { name: "Lille" },
      { name: "Nancy" },
      { name: "Dijon" },
      { name: "Lyon" },
      { name: "Grenoble" },
    ],
    edges: [
      { from: "Rennes", to: "Nantes", weight: 45 },
      { from: "Rennes", to: "Caen", weight: 75 },
      { from: "Rennes", to: "Paris", weight: 110 },
      { from: "Rennes", to: "Bordeaux", weight: 130 },

      { from: "Nantes", to: "Paris", weight: 80 },
      { from: "Nantes", to: "Bordeaux", weight: 90 },

      { from: "Caen", to: "Paris", weight: 50 },
      { from: "Caen", to: "Lille", weight: 65 },

      { from: "Paris", to: "Lille", weight: 70 },
      { from: "Paris", to: "Dijon", weight: 60 },
      { from: "Paris", to: "Nancy", weight: 120 },
      { from: "Paris", to: "Bordeaux", weight: 150 },

      { from: "Lille", to: "Nancy", weight: 100 },

      { from: "Nancy", to: "Dijon", weight: 75 },
      { from: "Nancy", to: "Grenoble", weight: 80 },
      { from: "Nancy", to: "Lyon", weight: 90 },

      { from: "Dijon", to: "Lyon", weight: 70 },
      { from: "Dijon", to: "Grenoble", weight: 75 },

      { from: "Lyon", to: "Grenoble", weight: 40 },

      { from: "Bordeaux", to: "Lyon", weight: 100 },
    ],
  };

  const { data, error, isLoading } = useSWR(
    [franceGraph, start],
    ([franceGraph, start]) => getBFSAsync(franceGraph, start)
  );
  console.log(data);

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bienvenue dans le projet ALMF51
          </Typography>
          <Typography variant="body1">
            Expérimentez les algorithmes de graphes : BFS, DFS, Kruskal, Prim,
            Dijkstra, Bellman-Ford et Floyd-Warshall.
          </Typography>
        </Box>
      </Container>
      <GraphNode/>
    </>
  );
}

export default App;
