import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button, Stack, Alert } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { graph } from "../../data/graph";
import { computeKruskalAsync } from "../../services/kruskalService";

const STEP_MS = 900;

type Step = { from: string; to: string; inMST: boolean };

type KruskalProps = {
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type KruskalHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const KruskalGraphAnimation = forwardRef<KruskalHandle, KruskalProps>(
  ({ onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const intervalRef = useRef<number | null>(null);

    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number | null>(null);

    // ⚠️ steps en state pour rerender (optionnel), mais REF pour l’animation immédiate
    const [steps, setSteps] = useState<Step[]>([]);
    const stepsRef = useRef<Step[]>([]);
    const currentStepRef = useRef(0);

    // --- Init du graphe ---
    useEffect(() => {
      if (!containerRef.current) return;

      const nodes = graph.nodes.map((city) => ({
        id: city,
        label: city,
        color: "#3b82f6",
      }));

      const edges: Edge[] = graph.edges.map((e: any) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        label: String(e.weight),
        font: { align: "top" },
        color: "#94a3b8",
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

    // --- Utils ---
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
        n.body.data.nodes.update({ id: node.id, color: "#3b82f6" })
      );
      n.body.data.edges.get().forEach((edge: any) =>
        n.body.data.edges.update({ id: edge.id, color: "#94a3b8", width: 2.5 })
      );
    };

    const findEdge = (u: string, v: string) => {
      const n: any = networkRef.current;
      return (
        n?.body.data.edges
          .get()
          .find((e: any) => (e.from === u && e.to === v) || (e.from === v && e.to === u)) || null
      );
    };

    // --- Une étape : colorier exactement UNE arête et ses nœuds ---
    const runStepOnce = (i: number, list: Step[] = stepsRef.current) => {
      if (!networkRef.current || i >= list.length) return;
      const { from, to, inMST } = list[i];
      const n: any = networkRef.current;

      const edge = findEdge(from, to);
      if (inMST) {
        if (edge) n.body.data.edges.update({ id: edge.id, color: "#22c55e", width: 4 });
        n.body.data.nodes.update([
          { id: from, color: { background: "#bbf7d0", border: "#22c55e" } },
          { id: to,   color: { background: "#bbf7d0", border: "#22c55e" } },
        ]);
        onLog?.(`✅ (${from}–${to}) ajoutée à l’ACM`);
      } else {
        if (edge) n.body.data.edges.update({ id: edge.id, color: "#cbd5e1", width: 2 });
        onLog?.(`❌ (${from}–${to}) rejetée (cycle)`);
      }

      currentStepRef.current = i + 1;
      if (currentStepRef.current >= list.length) {
        clearTimer();
        setRunning(false);
        onLog?.("🌲 Fin — Arbre couvrant minimal construit.");
      }
    };

    // --- Calcul (Kruskal) + préparation des étapes ---
    const prepareSteps = async () => {
      setError(null);
      setTotal(null);
      currentStepRef.current = 0;
      clearTimer();
      resetColors();

      onLog?.("🔹 Calcul Kruskal…");
      const res = await computeKruskalAsync(graph as any);
      const { edges, totalCost, evaluated } = res;

      if (!edges?.length && !evaluated?.length) {
        throw new Error("Aucune étape à animer (réponse API vide).");
      }

      setTotal(totalCost ?? null);

      const list: Step[] =
        evaluated?.map((e: any) => ({ from: e.from, to: e.to, inMST: !!e.inMST })) ??
        edges.map((e: any) => ({ from: e.from, to: e.to, inMST: true }));

      // ⚠️ MAJ ref AVANT de lancer l’animation
      stepsRef.current = list;
      setSteps(list); // pour l’UI (optionnel)

      onSummaryChange?.({
        algo: "Kruskal",
        edges: edges?.length ?? list.filter(x => x.inMST).length,
        cost: totalCost ?? undefined,
      });

      onLog?.(
        totalCost != null
          ? `💡 Prêt à animer : ${list.length} étapes, coût total = ${totalCost}`
          : `💡 Prêt à animer : ${list.length} étapes`
      );

      return list; // on renvoie la liste immédiate
    };

    // --- Lancer (bouton) : calcule et enchaîne les étapes ---
    const handleRun = async () => {
      if (!networkRef.current) return;
      try {
        const list = await prepareSteps();
        if (!list.length) return;
        setRunning(true);

        // ✅ colorier IMMEDIATEMENT la première étape
        runStepOnce(0, list);

        // puis poursuivre à partir de 1
        let idx = 1;
        clearTimer();
        intervalRef.current = window.setInterval(() => {
          runStepOnce(idx, list);
          idx++;
          if (idx >= list.length) {
            clearTimer();
            setRunning(false);
          }
        }, STEP_MS);
      } catch (err: any) {
        setError(err?.message || "Erreur API /kruskal.");
        setRunning(false);
        onLog?.(`❌ ${err?.message}`);
      }
    };

    // --- Contrôles exposés ---
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (running) return;

        // Si aucune étape prête, on prépare puis on anime
        if (stepsRef.current.length === 0) {
          try {
            const list = await prepareSteps();
            if (!list.length) return;
            setRunning(true);

            // ✅ colorier tout de suite l’étape 0
            runStepOnce(0, list);

            // puis interval
            let idx = 1;
            clearTimer();
            intervalRef.current = window.setInterval(() => {
              runStepOnce(idx, list);
              idx++;
              if (idx >= list.length) {
                clearTimer();
                setRunning(false);
              }
            }, STEP_MS);
            return;
          } catch (err: any) {
            setError(err?.message || "Erreur API /kruskal.");
            onLog?.(`❌ ${err?.message}`);
            return;
          }
        }

        // Sinon on reprend depuis currentStepRef
        setRunning(true);
        let idx = currentStepRef.current;
        clearTimer();

        // ✅ si on repart de 0, on colore immédiatement la première
        if (idx === 0) {
          runStepOnce(0);
          idx = 1;
        }

        intervalRef.current = window.setInterval(() => {
          runStepOnce(idx);
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
        onLog?.("⏸️ Pause");
      },
      reset: () => {
        clearTimer();
        resetColors();
        setRunning(false);
        setTotal(null);
        setSteps([]);
        stepsRef.current = [];
        currentStepRef.current = 0;
        setError(null);
        onLog?.("↺ Reset");
      },
      step: () => {
        if (stepsRef.current.length === 0) {
          onLog?.("ℹ️ Aucune étape : clique d’abord sur Lancer ou Play.");
          return;
        }
        runStepOnce(currentStepRef.current);
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Algorithme de Kruskal — Étape par étape
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
          <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={running} onClick={handleRun}>
            Lancer Kruskal
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={() => {
              clearTimer();
              resetColors();
              setRunning(false);
              setTotal(null);
              setSteps([]);
              stepsRef.current = [];
              currentStepRef.current = 0;
              setError(null);
              onLog?.("↺ Réinitialisation manuelle");
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

export default KruskalGraphAnimation;
