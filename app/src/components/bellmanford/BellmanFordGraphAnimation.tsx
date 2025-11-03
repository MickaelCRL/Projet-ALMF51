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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RouteIcon from "@mui/icons-material/Route";
import { graph } from "../../data/graph";
import { computeBellmanFordAsync } from "../../services/bellmanFordService";

const STEP_MS = 900;

// ----- Types tolérants côté API -----
type DistMap = Record<string, number | string | null>;
type PredMap = Record<string, string | null>;

type Relaxation = {
  u: string;
  v: string;
  improved?: boolean;
  newDist?: number;
};

type Iteration = {
  index?: number;
  relaxations?: Relaxation[];
  distances?: DistMap;
  predecessor?: PredMap;
};

type BellmanFordResult = {
  start?: string;
  target?: string;
  distances?: DistMap;
  predecessor?: PredMap; // ou 'parents'
  parents?: PredMap;
  Path?: string[];
  path?: string[];
  TotalCost?: number;
  totalCost?: number;
  iterations?: Iteration[];
  hasNegativeCycle?: boolean;
  negativeCycle?: string[]; // cycle explicite si fourni
};

// ----- Props & Handle -----
type BFProps = {
  start: string;
  target: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type BFHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const BellmanFordGraphAnimation = forwardRef<BFHandle, BFProps>(
  ({ start, target, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const intervalRef = useRef<number | null>(null);

    const cities = useMemo(
      () => (Array.isArray(graph.nodes) ? [...graph.nodes].sort() : []),
      []
    );

    // UI state
    const [start1, setStart1] = useState(start);
    const [target1, setTarget1] = useState(target);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [hasNegCycle, setHasNegCycle] = useState(false);

    // Animation
    const currentStepRef = useRef(0);
    const stepsRef = useRef<
      Array<
        | { kind: "relax"; u: string; v: string; improved: boolean; distances?: DistMap }
        | { kind: "path"; u: string; v: string }
        | { kind: "negcycle"; cycle: string[] }
      >
    >([]);

    // ---------- Vis Network init ----------
    useEffect(() => {
      if (!containerRef.current) return;

      const nodes = graph.nodes.map((city: string) => ({
        id: city,
        label: city,
        color: "#6366f1",
        title: "", // tooltip distances
      }));

      const edges: Edge[] = graph.edges.map((e: any) => ({
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

    const highlightStartTarget = (s: string, t: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      n.body.data.nodes.update({
        id: s,
        color: { background: "#fde68a", border: "#f59e0b" },
      });
      n.body.data.nodes.update({
        id: t,
        color: { background: "#fecaca", border: "#ef4444" },
      });
    };

    const updateDistanceTooltips = (dist?: DistMap) => {
      if (!dist) return;
      const n: any = networkRef.current;
      const fmt = (d: any) =>
        d === null || d === undefined || d === Infinity || d === "Infinity" ? "∞" : String(d);
      Object.keys(dist).forEach((k) =>
        n.body.data.nodes.update({ id: k, title: `d(${k}) = ${fmt((dist as any)[k])}` })
      );
    };

    const colorEdge = (u: string, v: string, color: string, width = 4) => {
      const n: any = networkRef.current;
      const e = findEdgeBetween(u, v);
      if (e) n.body.data.edges.update({ id: e.id, color, width });
    };

    const colorNodeState = (id: string, state: "active" | "settled") => {
      const n: any = networkRef.current;
      if (state === "active") {
        n.body.data.nodes.update({
          id,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });
      } else {
        n.body.data.nodes.update({
          id,
          color: { background: "#6366f1", border: "#4f46e5" },
        });
      }
    };

    // ---------- Build steps from API ----------
    const buildStepsFromResult = (res: BellmanFordResult) => {
      const steps: typeof stepsRef.current = [];

      const negCycle =
        res.hasNegativeCycle ||
        (Array.isArray(res.negativeCycle) && res.negativeCycle.length > 0);

      if (negCycle) {
        const cycle = (res.negativeCycle && res.negativeCycle.length
          ? res.negativeCycle
          : []) as string[];
        steps.push({ kind: "negcycle", cycle });
        return steps;
      }

      if (Array.isArray(res.iterations) && res.iterations.length > 0) {
        // Mode "relaxations" étape par étape
        res.iterations.forEach((it) => {
          const d = it.distances;
          (it.relaxations || []).forEach((r) => {
            // chaque relaxation = une étape
            steps.push({
              kind: "relax",
              u: r.u,
              v: r.v,
              improved: !!r.improved,
              distances: d,
            });
          });
        });
        return steps;
      }

      // Sinon, on a un chemin final : on anime les arêtes du chemin
      const path = (res.Path || res.path || []) as string[];
      if (path && path.length >= 2) {
        for (let i = 0; i < path.length - 1; i++) {
          steps.push({ kind: "path", u: path[i], v: path[i + 1] });
        }
      }
      return steps;
    };

    // ---------- Animation step ----------
    const runStep = (i: number) => {
      const step = stepsRef.current[i];
      if (!step) return;

      if (step.kind === "negcycle") {
        // colorier le cycle négatif si fourni
        const cyc = step.cycle || [];
        if (cyc.length >= 2) {
          for (let j = 0; j < cyc.length; j++) {
            const u = cyc[j];
            const v = cyc[(j + 1) % cyc.length];
            colorEdge(u, v, "#ef4444", 5); // rouge
          }
        } else {
          // si pas d’ordre, colorier toutes les arêtes en rouge pour signaler l’erreur
          const n: any = networkRef.current;
          n?.body.data.edges.get().forEach((e: any) =>
            n.body.data.edges.update({ id: e.id, color: "#ef4444", width: 4 })
          );
        }
        onLog?.("❌ Cycle de poids négatif détecté");
        setHasNegCycle(true);
        setRunning(false);
        return;
      }

      if (step.kind === "relax") {
        // surligner l’arête en cours
        colorEdge(step.u, step.v, step.improved ? "#22c55e" : "#f59e0b", 4);
        colorNodeState(step.u, "active");
        colorNodeState(step.v, "active");

        // distances tooltip snapshot
        updateDistanceTooltips(step.distances);

        onLog?.(
          `${step.improved ? "✔︎" : "·"} Relaxation (${step.u} → ${step.v})${
            step.improved ? " : amélioration" : ""
          }`
        );
      }

      if (step.kind === "path") {
        // Colorier le chemin final
        colorEdge(step.u, step.v, "#22c55e", 4);
        colorNodeState(step.u, "settled");
        colorNodeState(step.v, "settled");
        onLog?.(`Chemin: ${step.u} → ${step.v}`);
      }

      currentStepRef.current = i + 1;
      if (i + 1 >= stepsRef.current.length) {
        setRunning(false);
      }
    };

    // ---------- Run ----------
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
      setInfo(null);
      setTotal(null);
      setHasNegCycle(false);
      setRunning(true);
      clearTimer();
      resetColors();
      currentStepRef.current = 0;

      highlightStartTarget(start1, target1);
      onLog?.(`Bellman-Ford (${start1} → ${target1})`);

      try {
        const res: BellmanFordResult = await computeBellmanFordAsync(
          graph as any,
          start1,
          target1
        );

        const tCost = (res.TotalCost ?? res.totalCost ?? null) as number | null;
        setTotal(tCost ?? null);
        onSummaryChange?.({
          algo: "Bellman-Ford",
          start: start1,
          target: target1,
          distance: tCost ?? null,
          hasNegativeCycle:
            !!res.hasNegativeCycle || (Array.isArray(res.negativeCycle) && res.negativeCycle.length > 0),
          path: (res.Path || res.path) ?? undefined,
        });

        stepsRef.current = buildStepsFromResult(res);

        if (stepsRef.current.length === 0) {
          setInfo("Aucune étape à animer (pas d'itérations fournies et aucun chemin).");
          setRunning(false);
          return;
        }

        // Si on a un chemin final, focus caméra dessus
        const path = (res.Path || res.path) as string[] | undefined;
        if (path && path.length > 0) {
          networkRef.current!.fit({
            nodes: path,
            animation: { duration: 800, easingFunction: "easeInOutQuad" },
          });
        }

        // Animation auto
        let idx = 0;
        intervalRef.current = window.setInterval(() => {
          runStep(idx);
          idx++;
          if (idx >= stepsRef.current.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      } catch (e: any) {
        setRunning(false);
        setError(e?.message || "Erreur lors de l’appel API /bellman-ford.");
        onLog?.(`❌ ${e?.message}`);
      }
    };

    // ---------- Controls ----------
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!stepsRef.current.length || running || hasNegCycle) return;
        setRunning(true);
        onLog?.("▶️ Lecture Bellman-Ford");
        let idx = currentStepRef.current;
        clearTimer();
        intervalRef.current = window.setInterval(() => {
          runStep(idx);
          idx++;
          if (idx >= stepsRef.current.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      },
      pause: () => {
        clearTimer();
        setRunning(false);
        onLog?.("⏸️ Pause Bellman-Ford");
      },
      reset: () => {
        clearTimer();
        resetColors();
        setRunning(false);
        setError(null);
        setInfo(null);
        setTotal(null);
        setHasNegCycle(false);
        currentStepRef.current = 0;
        onLog?.("↺ Réinitialisation Bellman-Ford");
      },
      step: () => {
        runStep(currentStepRef.current);
      },
    }));
      {console.log(computeBellmanFordAsync(graph,start1,target1))}

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16, mb: 2 }}>
          Bellman-Ford — plus court chemin (poids négatifs autorisés)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 720 }}>
            {error}
          </Alert>
        )}
        {hasNegCycle && (
          <Alert severity="warning" sx={{ mb: 2, width: "100%", maxWidth: 720 }}>
            Cycle de poids négatif détecté — distances non définies.
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2, width: "100%", maxWidth: 720 }}>
            {info}
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
            <Button
              variant="contained"
              startIcon={<RouteIcon />}
              disabled={running}
              onClick={handleRun}
            >
              {running ? "Animation..." : "Lancer Bellman-Ford"}
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
                setInfo(null);
                setTotal(null);
                setHasNegCycle(false);
                currentStepRef.current = 0;
                onLog?.("Reset visuel Bellman-Ford");
              }}
            >
              Reset
            </Button>
          </Stack>

          {total !== null && !hasNegCycle && (
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
