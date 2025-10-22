import { useEffect, useMemo, useRef, useState } from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button, Stack, MenuItem, TextField, Alert } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import RouteIcon from "@mui/icons-material/Route";
import { graph } from "../../data/graph";
import { computeDijkstraAsync } from "../../services/dijkstraService";

type PathResult = { Path?: string[]; TotalCost?: number; path?: string[]; totalCost?: number };

export default function DijkstraGraphAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);
  const timerRef = useRef<number | null>(null);

  const cities = useMemo(() => (Array.isArray(graph.nodes) ? [...graph.nodes].sort() : []), []);
  const [start, setStart] = useState<string>(cities[0] ?? "");
  const [target, setTarget] = useState<string>(cities[1] ?? "");
  const [cost, setCost] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // init du graphe vis-network
  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = graph.nodes.map((city: string) => ({
      id: city,
      label: city,
      color: "#6366f1", // indigo-500
    }));

    const edges: Edge[] = graph.edges.map((e: any) => ({
      id: `${e.from}->${e.to}`,
      from: e.from,
      to: e.to,
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
        edges: { arrows: { to: false } }, // passe à true si orienté
        physics: { enabled: true },
        interaction: { hover: true, tooltipDelay: 150 },
      }
    );

    return () => {
      clearTimer();
      networkRef.current?.destroy();
      networkRef.current = null;
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetColors = () => {
    if (!networkRef.current) return;
    const n: any = networkRef.current;
    n.body.data.nodes.get().forEach((node: any) =>
      n.body.data.nodes.update({ id: node.id, color: "#6366f1", title: undefined })
    );
    n.body.data.edges.get().forEach((edge: any) =>
      n.body.data.edges.update({ id: edge.id, color: "#64748b", width: 2.5 })
    );
  };

  const findEdgeBetween = (u: string, v: string) => {
    if (!networkRef.current) return null;
    const n: any = networkRef.current;
    return (
      n.body.data.edges.get().find((e: any) => e.from === u && e.to === v) ||
      n.body.data.edges.get().find((e: any) => e.from === v && e.to === u) ||
      null
    );
  };

  const paintEndpoints = (s: string, t: string) => {
    if (!networkRef.current) return;
    const n: any = networkRef.current;
    n.body.data.nodes.update({
      id: s,
      color: { background: "#fde68a", border: "#f59e0b" }, // amber
    });
    n.body.data.nodes.update({
      id: t,
      color: { background: "#fecaca", border: "#ef4444" }, // red-ish
    });
  };

  const handleRun = async () => {
    if (!networkRef.current) return;
    if (!start || !target) {
      setError("Sélectionne départ et arrivée.");
      return;
    }
    if (start === target) {
      setError("Départ et arrivée identiques.");
      return;
    }

    setError(null);
    setCost(null);
    setRunning(true);
    clearTimer();
    resetColors();

    try {
      const res: PathResult = await computeDijkstraAsync(graph as any, start, target);
      const path: string[] = (res.Path ?? res.path ?? []) as string[];
      const totalCost: number | null = (res.TotalCost ?? res.totalCost ?? null) as number | null;

      if (!path || path.length === 0) {
        setRunning(false);
        setError("Aucun chemin trouvé par l’API.");
        return;
      }

      setCost(totalCost);
      paintEndpoints(start, target);

      // Fit caméra sur le chemin
      networkRef.current.fit({
        nodes: path,
        animation: { duration: 800, easingFunction: "easeInOutQuad" },
      });

      // Anime le chemin (1 arête/s)
      const pairs: Array<[string, string]> = [];
      for (let i = 0; i < path.length - 1; i++) pairs.push([path[i], path[i + 1]]);

      let idx = 0;
      timerRef.current = window.setInterval(() => {
        const [u, v] = pairs[idx] ?? [];
        const e = u && v ? findEdgeBetween(u, v) : null;
        if (e) {
          (networkRef.current as any).body.data.edges.update({
            id: e.id,
            color: "#22c55e", // green-500
            width: 4,
          });
        }
        idx++;
        if (idx >= pairs.length) {
          clearTimer();
          setRunning(false);
        }
      }, 1000);
    } catch (e: any) {
      setRunning(false);
      setError(e?.message || "Erreur lors de l’appel API /dijkstra.");
    }
  };

  const handleReset = () => {
    clearTimer();
    setRunning(false);
    setCost(null);
    setError(null);
    resetColors();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
      <Typography
        variant="body1"
        sx={{ color: "#64748b", fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", mb: 2 }}
      >
        Dijkstra — Chemin le plus court entre deux villes
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, width: "100%", maxWidth: 720 }}>
          {error}
        </Alert>
      )}

      <Paper
        ref={containerRef}
        elevation={6}
        sx={{
          height: "420px",
          width: "100%",
          maxWidth: "720px",
          border: "2px solid #cbd5e1",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mt: 2, width: "100%", maxWidth: 720 }}>
        <TextField
          select
          size="small"
          label="Départ"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {cities.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Arrivée"
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

        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<RouteIcon />} disabled={running} onClick={handleRun}>
            {running ? "Animation..." : "Lancer Dijkstra"}
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<ReplayIcon />} onClick={handleReset}>
            Reset
          </Button>
        </Stack>

        {cost !== null && !running && (
          <Typography variant="body2" sx={{ ml: { xs: 0, sm: "auto" } }}>
            Coût total : <b>{cost}</b>
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
