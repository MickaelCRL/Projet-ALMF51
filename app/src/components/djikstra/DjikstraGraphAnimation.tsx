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
import { graph } from "../../data/graph";
import { computeDijkstraAsync } from "../../services/dijkstraService";

type PathResult = {
  Path?: string[];
  path?: string[];
  TotalCost?: number;
  totalCost?: number;
};

type DijkstraProps = {
  start: string;
  target: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type DijkstraHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const DijkstraGraphAnimation = forwardRef<DijkstraHandle, DijkstraProps>(
  ({ start, target, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const timerRef = useRef<number | null>(null);

    const cities = useMemo(
      () => (Array.isArray(graph.nodes) ? [...graph.nodes].sort() : []),
      []
    );

    const [start1, setStart1] = useState<string>(start);
    const [target1, setTarget1] = useState<string>(target);
    const [cost, setCost] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState(false);
    const [pairs, setPairs] = useState<Array<[string, string]>>([]);
    const [currentStep, setCurrentStep] = useState(0);

    // --- Initialisation réseau ---
    useEffect(() => {
      if (!containerRef.current) return;

      const nodes = graph.nodes.map((city: string) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));

      const edges: Edge[] = graph.edges.map((e: any) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: String(e.weight ?? ""),
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
          interaction: { hover: true, tooltipDelay: 150 },
        }
      );

      return () => {
        clearTimer();
        networkRef.current?.destroy();
        networkRef.current = null;
      };
    }, []);

    // --- Utilitaires ---
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
        n.body.data.nodes.update({ id: node.id, color: "#6366f1" })
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
      // départ : vert
      n.body.data.nodes.update({
        id: s,
        color: { background: "#00FA9A", border: "#00FA9A" },
      });
      // arrivée : rouge
      n.body.data.nodes.update({
        id: t,
        color: { background: "#E63946", border: "#E63946" },
      });
    };

    // --- Coloration d'une arête ---
    const colorEdgeAndNode = (u: string, v: string) => {
      if (!networkRef.current) return;
      const edge = findEdgeBetween(u, v);
      if (edge) {
        (networkRef.current as any).body.data.edges.update({
          id: edge.id,
          color: "#FFB300",
          width: 4,
        });
      }
      // ⚠️ Ne recolore JAMAIS start ou target
      if (v !== start1 && v !== target1) {
        (networkRef.current as any).body.data.nodes.update({
          id: v,
          color: { background: "#2F4F4F", border: "#2F4F4F" },
        });
      }
      onLog?.(`Relaxation (${u} → ${v})`);
    };

    // --- Lancer Dijkstra ---
    const handleRun = async () => {
      if (!networkRef.current) return;
      if (!start1 || !target1) {
        setError("Sélectionne départ et arrivée.");
        return;
      }
      if (start1 === target1) {
        setError("Départ et arrivée identiques.");
        return;
      }

      setError(null);
      setCost(null);
      setRunning(true);
      clearTimer();
      resetColors();
      onLog?.(`Lancement Dijkstra (${start1} → ${target1})`);

      try {
        const res: PathResult = await computeDijkstraAsync(
          graph as any,
          start1,
          target1
        );
        const pathNow: string[] = (res.Path ?? res.path ?? []) as string[];
        const totalCost: number | null = (res.TotalCost ??
          res.totalCost ??
          null) as number | null;

        if (!pathNow || pathNow.length === 0) {
          setRunning(false);
          setError("Aucun chemin trouvé par l’API.");
          return;
        }

        setCost(totalCost);

        // Peindre départ/arrivée UNE FOIS, puis on les laisse tels quels
        paintEndpoints(start1, target1);

        const localPairs: Array<[string, string]> = [];
        for (let i = 0; i < pathNow.length - 1; i++)
          localPairs.push([pathNow[i], pathNow[i + 1]]);
        setPairs(localPairs);
        setCurrentStep(0);

        onSummaryChange?.({
          algo: "Dijkstra",
          start: start1,
          target: target1,
          distance: totalCost,
          path: pathNow,
        });
        onLog?.(`Chemin trouvé (${pathNow.join(" → ")}), coût = ${totalCost}`);

        networkRef.current.fit({
          nodes: pathNow,
          animation: { duration: 800, easingFunction: "easeInOutQuad" },
        });

        let idx = 0;
        timerRef.current = window.setInterval(() => {
          if (idx < localPairs.length) {
            const [u, v] = localPairs[idx];
            colorEdgeAndNode(u, v);
            setCurrentStep(idx + 1);
            idx++;
          } else {
            clearTimer();
            setRunning(false);
            onLog?.("✅ Chemin final coloré");
          }
        }, 1000);
      } catch (e: any) {
        setRunning(false);
        setError(e?.message || "Erreur lors de l’appel API /dijkstra.");
        onLog?.(`❌ ${e?.message}`);
      }
    };

    // --- Reset complet ---
    const handleReset = () => {
      clearTimer();
      setRunning(false);
      setCost(null);
      setError(null);
      resetColors();
      setCurrentStep(0);
      onLog?.("↺ Réinitialisation Dijkstra");
    };

    // --- Expose les contrôles à la barre commune ---
    useImperativeHandle(ref, () => ({
      play: () => {
        if (running || !pairs.length) return;
        setRunning(true);
        onLog?.("▶️ Lecture Dijkstra");
        let idx = currentStep;
        clearTimer();
        timerRef.current = window.setInterval(() => {
          if (idx < pairs.length) {
            const [u, v] = pairs[idx];
            colorEdgeAndNode(u, v);
            setCurrentStep(idx + 1);
            idx++;
          } else {
            clearTimer();
            setRunning(false);
            onLog?.("✅ Chemin final coloré");
          }
        }, 1000);
      },
      pause: () => {
        clearTimer();
        setRunning(false);
        onLog?.("⏸️ Pause Dijkstra");
      },
      reset: handleReset,
      step: () => {
        if (currentStep < pairs.length) {
          const [u, v] = pairs[currentStep];
          colorEdgeAndNode(u, v);
          setCurrentStep(currentStep + 1);
          if (currentStep + 1 === pairs.length) {
            setRunning(false);
            onLog?.("✅ Chemin final coloré");
          }
        }
      },
    }));

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ p: { xs: 3, md: 5 } }}
      >
        <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16 }}>
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
              {running ? "Animation..." : "Lancer Dijkstra"}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ReplayIcon />}
              onClick={handleReset}
            >
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
);

export default DijkstraGraphAnimation;
