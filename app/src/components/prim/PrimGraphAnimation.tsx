import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Network, type Edge } from "vis-network/standalone";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  MenuItem,
  TextField,
  Alert,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import RouteIcon from "@mui/icons-material/Route";
import { graph } from "../../data/graph";
import { computePrimAsync } from "../../services/primService";

const STEP_MS = 900;

type PrimProps = {
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type PrimHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

function orderTreeEdgesFromStart(pairs: Array<[string, string]>, start: string) {
  const adj = new Map<string, Set<string>>();
  for (const [u, v] of pairs) {
    if (!adj.has(u)) adj.set(u, new Set());
    if (!adj.has(v)) adj.set(v, new Set());
    adj.get(u)!.add(v);
    adj.get(v)!.add(u);
  }
  if (!adj.has(start)) return pairs;

  const visitedNode = new Set<string>();
  const visitedEdge = new Set<string>();
  const out: Array<[string, string]> = [];
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  const stack = [start];
  visitedNode.add(start);
  while (stack.length) {
    const u = stack.pop()!;
    for (const v of adj.get(u) ?? []) {
      const k = edgeKey(u, v);
      if (!visitedEdge.has(k)) {
        visitedEdge.add(k);
        if (!visitedNode.has(v)) {
          visitedNode.add(v);
          out.push([u, v]);
          stack.push(v);
        }
      }
    }
  }
  return out.length ? out : pairs;
}

const PrimGraphAnimation = forwardRef<PrimHandle, PrimProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const intervalRef = useRef<number | null>(null);

    const cities = useMemo(() => [...graph.nodes].sort(), []);
    const [start1, setStart1] = useState<string>(start);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const pairsRef = useRef<Array<[string, string]>>([]);

    useEffect(() => {
      if (!containerRef.current) return;

      const nodes = graph.nodes.map((city) => ({
        id: city,
        label: city,
        color: "#6366f1", // nœuds défaut
      }));
      const edges: Edge[] = graph.edges.map((e: any) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: String(e.weight),
        font: { align: "top" },
        color: "#64748b", // arêtes défaut
        width: 2.5,
      }));

      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges },
        {
          nodes: { shape: "dot", size: 22, borderWidth: 2 },
          edges: { arrows: { to: false } },
          physics: { enabled: true },
        }
      );

      return () => {
        clearTimer();
        networkRef.current?.destroy();
        networkRef.current = null;
      };
    }, []);

    const clearTimer = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const resetColors = () => {
      const n: any = networkRef.current;
      if (!n) return;
      n.body.data.nodes.get().forEach((node: any) =>
        n.body.data.nodes.update({ id: node.id, color: "#6366f1" })
      );
      n.body.data.edges.get().forEach((edge: any) =>
        n.body.data.edges.update({ id: edge.id, color: "#64748b", width: 2.5 })
      );
    };

    const findEdgeBetween = (u: string, v: string) => {
      const n: any = networkRef.current;
      return (
        n?.body.data.edges.get().find(
          (e: any) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
        ) || null
      );
    };

    // mêmes couleurs que Dijkstra/BF : arête active + nœuds visités
    const colorEdgeAndNodes = (u: string, v: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      const e = findEdgeBetween(u, v);
      if (e) {
        n.body.data.edges.update({
          id: e.id,
          color: "#FFB300",
          width: 4,
        });
      }
      // ne pas recolorer le start
      if (u !== start1) {
        n.body.data.nodes.update({
          id: u,
          color: { background: "#2F4F4F", border: "#2F4F4F" },
        });
      }
      if (v !== start1) {
        n.body.data.nodes.update({
          id: v,
          color: { background: "#2F4F4F", border: "#2F4F4F" },
        });
      }
      onLog?.(`Ajout de l’arête (${u}–${v})`);
    };

    const runStep = (i: number) => {
      const pairs = pairsRef.current;
      if (i >= pairs.length) return;
      const [u, v] = pairs[i];
      colorEdgeAndNodes(u, v);
      setCurrentStep(i + 1);
      if (i + 1 >= pairs.length) {
        setRunning(false);
        onLog?.("✅ Arbre couvrant minimal construit (Prim terminé)");
      }
    };

    const handleRun = async () => {
      if (!networkRef.current) return;
      if (!start1) {
        setError("Choisis un sommet de départ.");
        return;
      }

      setError(null);
      setTotal(null);
      setRunning(true);
      resetColors();
      setCurrentStep(0);
      clearTimer();
      onLog?.(`Lancement de Prim depuis ${start1}`);

      // Start en vert (et on ne le touchera plus)
      (networkRef.current as any).body.data.nodes.update({
        id: start1,
        color: { background: "#00FA9A", border: "#00FA9A" },
      });

      try {
        const res = await computePrimAsync(graph as any, start1);
        const { edges, totalCost } = res;

        if (!edges?.length) {
          setError("Aucune arête trouvée.");
          setRunning(false);
          return;
        }

        const pRaw = edges.map((e: any) => [e.from, e.to]) as Array<[string, string]>;
        const p = orderTreeEdgesFromStart(pRaw, start1);

        pairsRef.current = p;

        setTotal(totalCost);
        onSummaryChange?.({
          algo: "Prim",
          start: start1,
          edges: edges.length,
          cost: totalCost,
        });
        onLog?.(`Prim sélectionne ${edges.length} arêtes (coût total = ${totalCost})`);

        let idx = 0;
        intervalRef.current = window.setInterval(() => {
          runStep(idx);
          idx++;
          if (idx >= pairsRef.current.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      } catch (err: any) {
        setError(err?.message || "Erreur API /prim.");
        setRunning(false);
        onLog?.(`❌ ${err?.message}`);
      }
    };

    useImperativeHandle(ref, () => ({
      play: () => {
        if (!pairsRef.current.length || running) return;
        setRunning(true);
        onLog?.("▶️ Lecture Prim");
        let idx = currentStep;
        clearTimer();
        intervalRef.current = window.setInterval(() => {
          runStep(idx);
          idx++;
          if (idx >= pairsRef.current.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      },
      pause: () => {
        clearTimer();
        setRunning(false);
        onLog?.("⏸️ Pause Prim");
      },
      reset: () => {
        clearTimer();
        resetColors();
        setRunning(false);
        setTotal(null);
        setCurrentStep(0);
        onLog?.("↺ Réinitialisation Prim");
      },
      step: () => {
        runStep(currentStep);
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16 }}>
          Algorithme de Prim
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          ref={containerRef}
          sx={{
            height: 420,
            width: "100%",
            maxWidth: 720,
            mb: 2,
            border: "2px solid #cbd5e1",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            select
            label="Sommet de départ"
            value={start1}
            onChange={(e) => setStart1(e.target.value)}
            size="small"
          >
            {cities.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<RouteIcon />}
            disabled={running}
            onClick={handleRun}
          >
            Lancer Prim
          </Button>

          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={() => {
              clearTimer();
              resetColors();
              setRunning(false);
              setCurrentStep(0);
              onLog?.("Réinitialisation manuelle Prim");
            }}
          >
            Reset
          </Button>

          {total !== null && (
            <Typography variant="body2">
              Coût total : <b>{total}</b>
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }
);

export default PrimGraphAnimation;
