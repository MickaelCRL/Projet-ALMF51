import { useEffect, useMemo, useRef, useState } from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button, Stack, MenuItem, TextField } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import RouteIcon from "@mui/icons-material/Route";
import useSWR from "swr";
import { graph } from "../../data/graph";
// Service attendu : calcule Dijkstra (poids > 0)
import { computeDijkstraAsync } from "../../services/dijkstraService";

type ParentsMap = Record<string, string | null>;
type DistMap = Record<string, number>;

export default function DijkstraGraphAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);

  const [isFinished, setIsFinished] = useState(false);
  const [target, setTarget] = useState<string>("Lille"); // destination par défaut
  const start = "Rennes"; // même point de départ que ton DFS

  const { data: dijkstra } = useSWR(["dijkstra", graph, start], () =>
    computeDijkstraAsync(graph, start)
  );

  const cities = useMemo(() => graph.nodes.slice().sort(), []);
  useEffect(() => {
    if (!containerRef.current || !dijkstra) return;

    // Noeuds
    const nodes = graph.nodes.map((city) => ({
      id: city,
      label: city,
      color: "#6366f1", // indigo-500
    }));

    // Arêtes avec labels de poids
    const edges: Edge[] = graph.edges.map((e) => ({
      id: `${e.from}->${e.to}`,
      from: e.from,
      to: e.to,
      // Si ton graphe est non orienté, vis-network affichera les deux sens comme une seule arête
      label: String(e.weight ?? e.w ?? e.cost ?? ""),
      font: { align: "top" },
      color: "#64748b", // slate-500
      width: 2.5,
      smooth: { enabled: true, type: "cubicBezier", roundness: 0.4 } as any,
    }));

    networkRef.current = new Network(
      containerRef.current,
      { nodes, edges },
      {
        nodes: { shape: "dot", size: 22, borderWidth: 2 },
        edges: { arrows: { to: false } },
        physics: { enabled: true },
        interaction: { hover: true, tooltipDelay: 150 },
      }
    );

    // Premier lancement
    runAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dijkstra]);

  const resetColors = () => {
    if (!networkRef.current) return;
    const network: any = networkRef.current;
    network.body.data.nodes.get().forEach((n: any) =>
      network.body.data.nodes.update({ id: n.id, color: "#6366f1" })
    );
    network.body.data.edges.get().forEach((e: any) =>
      network.body.data.edges.update({ id: e.id, color: "#64748b", width: 2.5 })
    );
  };

  const findEdgeBetween = (u: string, v: string) => {
    if (!networkRef.current) return null;
    const network: any = networkRef.current;
    return (
      network.body.data.edges.get().find((e: any) => e.from === u && e.to === v) ||
      network.body.data.edges.get().find((e: any) => e.from === v && e.to === u) ||
      null
    );
  };

  const runAnimation = () => {
    if (!networkRef.current || !dijkstra) return;
    const { order, parents } = dijkstra as { order: string[]; parents: ParentsMap; dist: DistMap };
    const network: any = networkRef.current;

    resetColors();
    setIsFinished(false);

    // Marque le départ en surbrillance douce
    network.body.data.nodes.update({
      id: start,
      color: { background: "#a5b4fc", border: "#6366f1" }, // indigo-300 / 500
    });

    let index = 0;
    const interval = setInterval(() => {
      // Remet le précédent en couleur "settled"
      if (index > 0) {
        const prev = order[index - 1];
        network.body.data.nodes.update({
          id: prev,
          color: { background: "#6366f1", border: "#4f46e5" }, // indigo-500/600
        });
      }

      if (index < order.length) {
        const u = order[index];

        // Noeud courant "extrait" (clé minimum)
        network.body.data.nodes.update({
          id: u,
          color: { background: "#a5b4fc", border: "#6366f1" }, // en cours
        });

        // Edge du SPT (parent -> u) en rouge
        const p = parents[u];
        if (p) {
          const e = findEdgeBetween(p, u);
          if (e) network.body.data.edges.update({ id: e.id, color: "red", width: 3.2 });
        }

        index++;
      } else {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 900);
  };

  const highlightPathTo = (dest: string) => {
    if (!networkRef.current || !dijkstra) return;
    resetColors();

    const { parents, dist } = dijkstra as { order: string[]; parents: ParentsMap; dist: DistMap };
    const network: any = networkRef.current;

    // Recolor SPT (optionnel: on peut aussi tout laisser gris)
    Object.entries(parents).forEach(([v, p]) => {
      if (p) {
        const e = findEdgeBetween(p, v);
        if (e) network.body.data.edges.update({ id: e.id, color: "#94a3b8", width: 2.5 }); // slate-400
      }
    });

    // Reconstruire le chemin parents -> dest
    const path: string[] = [];
    let cur: string | null = dest;
    while (cur) {
      path.push(cur);
      cur = parents[cur] ?? null;
    }
    // Si la racine n'est pas "start", alors pas de chemin
    if (path[path.length - 1] !== start) {
      // Juste colorer le start/target pour le feedback
      network.body.data.nodes.update({ id: start, color: { background: "#fde68a", border: "#f59e0b" } }); // amber
      network.body.data.nodes.update({ id: dest, color: { background: "#fecaca", border: "#ef4444" } }); // rose/red
      return;
    }

    // Met en avant le chemin final en VERT
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i + 1];
      const v = path[i];
      const e = findEdgeBetween(u, v);
      if (e) network.body.data.edges.update({ id: e.id, color: "green", width: 4 });
    }

    // Noeuds du chemin
    path.forEach((v) =>
      network.body.data.nodes.update({
        id: v,
        color: { background: "#bbf7d0", border: "#22c55e" }, // green-200/500
      })
    );

    // Feedback start/dest + distance
    network.body.data.nodes.update({
      id: start,
      title: `Départ: ${start}\nDistance 0`,
    });
    network.body.data.nodes.update({
      id: dest,
      title: `Arrivée: ${dest}\nDistance: ${dist[dest] ?? "∞"}`,
    });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
      <Typography
        variant="body1"
        sx={{ color: "#64748b", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", mb: 2 }}
      >
        Dijkstra – Arbre des plus courts chemins depuis <strong>{start}</strong>
      </Typography>

      <Paper
        ref={containerRef}
        elevation={6}
        sx={{
          height: "420px",
          width: "100%",
          maxWidth: "680px",
          border: "2px solid #cbd5e1",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mt: 2 }}>
        {isFinished && (
          <Button onClick={runAnimation} startIcon={<ReplayIcon />} sx={{ textTransform: "none", fontSize: 16 }}>
            Rejouer l’animation
          </Button>
        )}
        <TextField
          select
          size="small"
          label="Destination"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {cities
            .filter((c) => c !== start)
            .map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
        </TextField>
        <Button
          variant="outlined"
          startIcon={<RouteIcon />}
          onClick={() => highlightPathTo(target)}
          sx={{ textTransform: "none", fontSize: 16 }}
        >
          Afficher le plus court chemin
        </Button>
      </Stack>
    </Box>
  );
}
