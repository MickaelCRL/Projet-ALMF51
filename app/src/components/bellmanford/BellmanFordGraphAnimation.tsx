// src/components/bellmanford/BellmanFordGraphAnimation.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
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
import { graphN } from "../../data/graphNegative";
import { computeBellmanFordAsync } from "../../services/bellmanFordService";

const STEP_MS = 900;

// --- Types correspondant à ta nouvelle API ---
type DistMap = Record<string, number>;
type ParentsMap = Record<string, string | null>;
type ApiResult = {
  distances: DistMap;
  parents: ParentsMap;
};

// --- Props & Handle (compat barre de contrôle) ---
type BFProps = {
  start?: string;  // <- rend optionnels pour permettre défaut s1/as2
  target?: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type BFHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

// reconstruit le chemin target ← … ← start via parents renvoyés par l’API
function reconstructPath(
  parents: ParentsMap,
  start: string,
  target: string
): string[] | null {
  const path: string[] = [];
  let cur: string | null = target;
  const guard = new Set<string>();
  while (cur != null) {
    if (guard.has(cur)) return null;
    guard.add(cur);
    path.push(cur);
    if (cur === start) break;
    cur = parents[cur] ?? null;
  }
  if (path[path.length - 1] !== start) return null;
  path.reverse();
  return path;
}

const BellmanFordGraphAnimation = forwardRef<BFHandle, BFProps>(
  ({ start, target, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const intervalRef = useRef<number | null>(null);

    const cities = useMemo(
      () => (Array.isArray(graphN.nodes) ? [...graphN.nodes].sort() : []),
      []
    );

    // --- États avec valeurs par défaut "s1" et "as2"
    const [start1, setStart1] = useState<string>(start ?? "s1");
    const [target1, setTarget1] = useState<string>(target ?? "as2");

    // Si "s1"/"as2" ne sont pas présents (ou identiques), on corrige après chargement des nodes
    useEffect(() => {
      if (!cities.length) return;

      let s = start1;
      let t = target1;

      if (!cities.includes(s)) s = cities[0];
      // s et t ne doivent pas être égaux, ni t absent
      if (!cities.includes(t) || t === s) {
        t = cities.find((c) => c !== s) ?? s;
      }

      if (s !== start1) setStart1(s);
      if (t !== target1) setTarget1(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cities]);

    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number | null>(null);

    // animation
    const pairsRef = useRef<Array<[string, string]>>([]);
    const currentStepRef = useRef(0);

    // ---------- Vis Network init ----------
    useEffect(() => {
      if (!containerRef.current) return;

      const nodes = graphN.nodes.map((city: string) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));

      const edges: Edge[] = graphN.edges.map((e: any) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: e.weight != null ? String(e.weight) : "",
        font: { align: "top" },
        color: "#64748b",
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
          interaction: { hover: true, tooltipDelay: 120 },
        }
      );

      return () => {
        clearTimer();
        networkRef.current?.destroy();
        networkRef.current = null;
      };
    }, []);

    // ---------- Utils ----------
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
        n.body.data.nodes.update({ id: node.id, color: "#6366f1", title: "" })
      );
      n.body.data.edges.get().forEach((edge: any) =>
        n.body.data.edges.update({ id: edge.id, color: "#64748b", width: 2.5 })
      );
    };

    const findEdgeBetween = (u: string, v: string) => {
      const n: any = networkRef.current;
      return (
        n?.body.data.edges
          .get()
          .find((e: any) => (e.from === u && e.to === v) || (e.from === v && e.to === u)) || null
      );
    };

    const highlightEndpoints = (s: string, t: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      n.body.data.nodes.update({
        id: s,
        color: { background: "#00FA9A", border: "#00FA9A" },
      });
      n.body.data.nodes.update({
        id: t,
        color: { background: "#E63946", border: "#E63946" },
      });
    };

    // ⚠️ Modifié pour NE PAS recolorier start/target
    const colorEdgeAndNode = (u: string, v: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      const e = findEdgeBetween(u, v);
      if (e) {
        n.body.data.edges.update({ id: e.id, color: "#FFB300", width: 4 });
      }
      // ⛔ ne pas toucher aux couleurs de départ/arrivée
      if (v !== start1 && v !== target1) {
        n.body.data.nodes.update({
          id: v,
          color: { background: "#2F4F4F", border: "#2F4F4F" },
        });
      }
    };

    const updateDistanceTooltips = (dist: DistMap) => {
      const n: any = networkRef.current;
      Object.entries(dist).forEach(([k, d]) =>
        n.body.data.nodes.update({
          id: k,
          title: `d(${k}) = ${Number.isFinite(d) ? d : "∞"}`,
        })
      );
    };

    // ---------- Une étape ----------
    const runStep = (i: number) => {
      const pairs = pairsRef.current;
      if (!pairs.length || i >= pairs.length) return;
      const [u, v] = pairs[i];
      colorEdgeAndNode(u, v);
      currentStepRef.current = i + 1;
      if (i + 1 >= pairs.length) {
        setRunning(false);
      }
    };

    // ---------- Lancer ----------
    const handleRun = async () => {
      if (!networkRef.current) return;
      if (!start1 || !target1) {
        setError("Sélectionne un départ et une arrivée.");
        return;
      }
      if (start1 === target1) {
        setError("Départ et arrivée identiques.");
        return;
      }

      setError(null);
      setTotal(null);
      setRunning(true);
      clearTimer();
      resetColors();
      currentStepRef.current = 0;

      // peint UNE FOIS, puis on n'y touche plus
      highlightEndpoints(start1, target1);

      try {
        // API : (graph, start)
        const res: ApiResult = await computeBellmanFordAsync(graphN as any, start1);

        if (res?.distances) updateDistanceTooltips(res.distances);

        const path = reconstructPath(res.parents ?? {}, start1, target1);
        if (!path || path.length < 2) {
          setRunning(false);
          setError("Aucun chemin trouvé (via parents).");
          return;
        }

        const pairs: Array<[string, string]> = [];
        for (let i = 0; i < path.length - 1; i++) pairs.push([path[i], path[i + 1]]);
        pairsRef.current = pairs;

        const totalCost = res.distances?.[target1];
        setTotal(Number.isFinite(totalCost) ? (totalCost as number) : null);

        onSummaryChange?.({
          algo: "Bellman-Ford",
          start: start1,
          target: target1,
          distance: Number.isFinite(totalCost) ? totalCost : null,
          path,
        });

        networkRef.current.fit({
          nodes: path,
          animation: { duration: 800, easingFunction: "easeInOutQuad" },
        });

        let idx = 0;
        intervalRef.current = window.setInterval(() => {
          runStep(idx);
          idx++;
          if (idx >= pairsRef.current.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      } catch (e: any) {
        setRunning(false);
        setError(e?.message || "Erreur lors de l’appel API /bellman-ford.");
      }
    };

    // ---------- Controls ----------
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!pairsRef.current.length || running) return;
        setRunning(true);
        let idx = currentStepRef.current;
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
      },
      reset: () => {
        clearTimer();
        resetColors();
        setRunning(false);
        setError(null);
        setTotal(null);
        currentStepRef.current = 0;
        pairsRef.current = [];
      },
      step: () => {
        runStep(currentStepRef.current);
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16 }}>
          Bellman-Ford — plus court chemin (poids négatifs autorisés)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 720 }}>
            {error}
          </Alert>
        )}

        <Paper
          ref={containerRef}
          elevation={6}
          sx={{
            height: 420,
            width: "100%",
            maxWidth: 720,
            border: "2px solid #cbd5e1",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ mt: 2, width: "100%", maxWidth: 720 }}
        >
          <TextField
            select
            size="small"
            label="Départ"
            value={start1}
            onChange={(e) => setStart1(e.target.value)}
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
            value={target1}
            onChange={(e) => setTarget1(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {cities
              .filter((c) => c !== start1)
              .map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<RouteIcon />} disabled={running} onClick={handleRun}>
              {running ? "Animation..." : " Lancer"}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ReplayIcon />}
              onClick={() => {
                clearTimer();
                resetColors();
                setRunning(false);
                setError(null);
                setTotal(null);
                currentStepRef.current = 0;
                pairsRef.current = [];
              }}
            >
              Reset
            </Button>
          </Stack>

          {total !== null && (
            <Typography variant="body2" sx={{ ml: { xs: 0, sm: "auto" } }}>
              Coût total : <b>{total}</b>
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }
);

export default BellmanFordGraphAnimation;
