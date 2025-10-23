import { useEffect, useMemo, useRef, useState } from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button, Stack, Alert } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { graph } from "../../data/graph";
import { computeKruskalAsync } from "../../services/kruskalService";

export default function KruskalGraphAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);
  const timerRef = useRef<number | null>(null);

  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = graph.nodes.map((city) => ({ id: city, label: city, color: "#6366f1" }));
    const edges: Edge[] = graph.edges.map((e: any) => ({
      id: `${e.from}->${e.to}`,
      from: e.from,
      to: e.to,
      label: String(e.weight),
      font: { align: "top" },
      color: "#64748b",
      width: 2.5,
    }));

    networkRef.current = new Network(containerRef.current, { nodes, edges }, {
      nodes: { shape: "dot", size: 22, borderWidth: 2 },
      edges: { arrows: { to: false } },
      physics: { enabled: true },
    });

    return () => {
      clearInterval(timerRef.current ?? undefined);
      networkRef.current?.destroy();
    };
  }, []);

  const resetColors = () => {
    const n: any = networkRef.current;
    n?.body.data.nodes.get().forEach((node: any) =>
      n.body.data.nodes.update({ id: node.id, color: "#6366f1" })
    );
    n?.body.data.edges.get().forEach((edge: any) =>
      n.body.data.edges.update({ id: edge.id, color: "#64748b", width: 2.5 })
    );
  };

  const findEdgeBetween = (u: string, v: string) => {
    const n: any = networkRef.current;
    return (
      n?.body.data.edges.get().find((e: any) => (e.from === u && e.to === v) || (e.from === v && e.to === u)) ||
      null
    );
  };

  const handleRun = async () => {
    if (!networkRef.current) return;
    setError(null);
    setTotal(null);
    setRunning(true);
    resetColors();

    try {
      const res = await computeKruskalAsync(graph as any);
      const { edges, totalCost } = res;

      if (!edges?.length) {
        setError("Aucune arête trouvée.");
        setRunning(false);
        return;
      }

      setTotal(totalCost);
      const pairs = edges.map((e: any) => [e.from, e.to]);
      let idx = 0;
      timerRef.current = window.setInterval(() => {
        const [u, v] = pairs[idx];
        const e = findEdgeBetween(u, v);
        if (e)
          (networkRef.current as any).body.data.edges.update({
            id: e.id,
            color: "#22c55e",
            width: 4,
          });
        idx++;
        if (idx >= pairs.length) {
          clearInterval(timerRef.current ?? undefined);
          setRunning(false);
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Erreur API /kruskal.");
      setRunning(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: 3 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Algorithme de Kruskal
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper ref={containerRef} sx={{ height: 420, width: "100%", maxWidth: 720, mb: 2 }} />

      <Stack direction="row" spacing={2}>
        <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={running} onClick={handleRun}>
          Lancer Kruskal
        </Button>
        <Button variant="outlined" startIcon={<ReplayIcon />} onClick={() => resetColors()}>
          Reset
        </Button>
        {total !== null && <Typography variant="body2">Coût total : {total}</Typography>}
      </Stack>
    </Box>
  );
}
