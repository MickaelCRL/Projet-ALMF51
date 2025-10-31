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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { graph } from "../../data/graph";
import { computePrimAsync } from "../../services/primService";

// 🔹 Props + callbacks
type PrimProps = {
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

// 🔹 Ref exposée
export type PrimHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const PrimGraphAnimation = forwardRef<PrimHandle, PrimProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const timerRef = useRef<number | null>(null);

    const cities = useMemo(() => [...graph.nodes].sort(), []);
    const [start1, setStart1] = useState<string>(start);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [pairs, setPairs] = useState<Array<[string, string]>>([]);
    const [currentStep, setCurrentStep] = useState(0);

    // --- Initialisation du graphe vis-network ---
    useEffect(() => {
      if (!containerRef.current) return;
      const nodes = graph.nodes.map((city) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));
      const edges: Edge[] = graph.edges.map((e: any) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: String(e.weight),
        font: { align: "top" },
        color: "#64748b",
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
        clearInterval(timerRef.current ?? undefined);
        networkRef.current?.destroy();
      };
    }, []);

    // --- Fonctions utilitaires ---
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
        n?.body.data.edges.get().find(
          (e: any) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
        ) || null
      );
    };

    // --- Étape unique ---
    const runStep = (i: number) => {
      const [u, v] = pairs[i] ?? [];
      if (!u || !v) return;
      const e = findEdgeBetween(u, v);
      if (e) {
        (networkRef.current as any).body.data.edges.update({
          id: e.id,
          color: "#22c55e",
          width: 4,
        });
        onLog?.(`Ajout de l’arête (${u}–${v})`);
      }
      setCurrentStep(i + 1);
      if (i + 1 >= pairs.length) {
        setRunning(false);
        onLog?.("✅ Arbre couvrant minimal construit (Prim terminé)");
      }
    };

    // --- Lancer Prim ---
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
      onLog?.(`Lancement de Prim depuis ${start1}`);

      try {
        const res = await computePrimAsync(graph as any, start1);
        const { edges, totalCost } = res;

        if (!edges?.length) {
          setError("Aucune arête trouvée.");
          setRunning(false);
          return;
        }

        setTotal(totalCost);
        const p = edges.map((e: any) => [e.from, e.to]) as Array<[string, string]>;
        setPairs(p);
        setCurrentStep(0);

        onSummaryChange?.({
          algo: "Prim",
          start: start1,
          edges: edges.length,
          cost: totalCost,
        });

        onLog?.(
          `Prim sélectionne ${edges.length} arêtes (coût total = ${totalCost})`
        );

        timerRef.current = window.setInterval(() => {
          runStep(currentStep);
          setCurrentStep((s) => s + 1);
        }, 1000);
      } catch (err: any) {
        setError(err?.message || "Erreur API /prim.");
        setRunning(false);
        onLog?.(`❌ ${err?.message}`);
      }
    };

    // --- Expose les contrôles à la barre commune ---
    useImperativeHandle(ref, () => ({
      play: () => {
        if (pairs.length === 0 || running) return;
        setRunning(true);
        onLog?.("▶️ Lecture Prim");
        timerRef.current = window.setInterval(() => {
          runStep(currentStep);
          setCurrentStep((s) => s + 1);
        }, 1000);
      },
      pause: () => {
        clearInterval(timerRef.current ?? undefined);
        setRunning(false);
        onLog?.("⏸️ Pause Prim");
      },
      reset: () => {
        clearInterval(timerRef.current ?? undefined);
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ p: 3 }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
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
            startIcon={<PlayArrowIcon />}
            disabled={running}
            onClick={handleRun}
          >
            Lancer Prim
          </Button>

          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={() => {
              resetColors();
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
