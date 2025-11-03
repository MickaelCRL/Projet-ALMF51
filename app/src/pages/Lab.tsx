import { useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, MenuItem, TextField, Divider } from "@mui/material";

// ⚠️ Adapte ces imports aux chemins de TON projet :
import { graph } from "../data/graph"; // ton graph {nodes: string[], edges: ..., isOriented}
import BFSGraphAnimation from "../components/bfs/BFSGraphAnimation";
import DFSGraphAnimation from "../components/dfs/DFSGraphAnimation";
import DijkstraGraphAnimation from "../components/djikstra/DjikstraGraphAnimation";
import KruskalGraphAnimation from "../components/kruskal/KruskalGraphAnimation";
import PrimGraphAnimation from "../components/prim/PrimGraphAnimation";
import BellmanFordGraphAnimation from "../components/bellmanford/BellmanFordGraphAnimation";
import FloydWarshallGraphAnimation from "../components/floydwarshall/FloydWarshallGraphAnimation";
// ↑ Si certains n’existent pas encore, commente l’import + le case correspondant.

type AlgoKey =
  | "BFS"
  | "DFS"
  | "Dijkstra"
  | "Bellman-Ford"
  | "Floyd-Warshall"
  | "Kruskal"
  | "Prim";

export default function Lab() {
  const [algo, setAlgo] = useState<AlgoKey>("Dijkstra");
  const [start, setStart] = useState<string>("Paris");
  const [target, setTarget] = useState<string>("Lille");

  const nodes = useMemo(() => graph.nodes, []);

  // Rendu du composant d’animation existant en fonction de l’algo choisi.
  const renderAlgo = () => {
    switch (algo) {
      case "BFS":
        return (
          <BFSGraphAnimation
            start={start}
          />
        );
      case "DFS":
        return (
          <DFSGraphAnimation
            start={start}
          />
        );
      case "Dijkstra":
        return (
          <DijkstraGraphAnimation
            start={start}
            target={target}
          />
        );
      case "Bellman-Ford":
        return <BellmanFordGraphAnimation
          start={start}
          target={target} 
        ></BellmanFordGraphAnimation>
      case "Floyd-Warshall":
        return <FloydWarshallGraphAnimation 
        start={start}
        target={target}></FloydWarshallGraphAnimation>
      case "Kruskal":
        return <KruskalGraphAnimation />;
      case "Prim":
        return <PrimGraphAnimation start={start} />;
      default:
        return null;
    }
  };

  // Champs à afficher selon l’algo
  const needsStart = ["BFS", "DFS"].includes(algo);
  const needsTarget = [].includes(algo);

  return (
    
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
        minHeight: "calc(100vh - 64px)", // si tu as un header
      }}
    >
      {/* Panneau gauche */}
      <Box
        sx={{
          borderRight: { md: "1px solid #e2e8f0" },
          p: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Paramètres
          </Typography>

          <TextField
            select
            label="Algorithme"
            value={algo}
            onChange={(e) => setAlgo(e.target.value as AlgoKey)}
            size="small"
          >
            <MenuItem value="BFS">BFS (parcours largeur)</MenuItem>
            <MenuItem value="DFS">DFS (parcours profondeur)</MenuItem>
            <MenuItem value="Dijkstra">Dijkstra (poids ≥ 0)</MenuItem>
            <MenuItem value="Bellman-Ford">Bellman-Ford (poids ±)</MenuItem>
            <MenuItem value="Floyd-Warshall">Floyd–Warshall (all-to-all)</MenuItem>
            <MenuItem value="Kruskal">Kruskal (ACM)</MenuItem>
            <MenuItem value="Prim">Prim (ACM)</MenuItem>
          </TextField>

          {needsStart && (
            <TextField
              select
              label="Sommet de départ"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              size="small"
            >
              {nodes.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          )}

          {needsTarget && (
            <TextField
              select
              label="Sommet d'arrivée"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              size="small"
            >
              {nodes.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Divider />
        </Stack>
      </Box>

      {/* Zone droite : graphe / animation */}
      <Box sx={{ p: 2 }}>
        <Paper
          elevation={3}
          sx={{
            height: { xs: 520, md: "calc(100vh - 96px)" },
            p: 1,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {renderAlgo()}
        </Paper>
      </Box>
    </Box>
  );
}
