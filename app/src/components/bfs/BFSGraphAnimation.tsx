import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import useSWR from "swr";
import { computeBFSAsync } from "../../services/bfsService";
import { graph } from "../../data/graph";

const STEP_MS = 800;
type ParentsMap = Record<string, string | null>;

type BFSProps = {
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (message: string) => void;
};

export type BFSHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

// -- rend le graphe non orienté pour l’API
function expandUndirected<G extends { edges: any[]; isOriented?: boolean }>(g: G): G {
  if (g.isOriented) return g;
  const edges: any[] = [];
  const seen = new Set<string>();
  for (const e of g.edges) {
    const k1 = `${e.from}|${e.to}`;
    const k2 = `${e.to}|${e.from}`;
    if (!seen.has(k1)) {
      edges.push({ ...e });
      seen.add(k1);
    }
    if (!seen.has(k2)) {
      edges.push({ from: e.to, to: e.from, weight: e.weight });
      seen.add(k2);
    }
  }
  return { ...(g as any), edges, isOriented: false };
}

const BFSGraphAnimation = forwardRef<BFSHandle, BFSProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const G = useRef(expandUndirected(graph)).current;
    const orderRef = useRef<string[]>([]);
    const parentsRef = useRef<ParentsMap>({});
    const intervalRef = useRef<number | null>(null);

    const { data: bfsResult } = useSWR(["bfs-tree", start], () =>
      computeBFSAsync(G as any, start)
    );

    const clearTimer = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const resetAll = () => {
      const n: any = networkRef.current;
      if (!n) return;
      // supprimer toutes les arêtes
      const allEdges = n.body.data.edges.get().map((e: any) => e.id);
      n.body.data.edges.remove(allEdges);
      // réinitialiser les nœuds
      n.body.data.nodes.get().forEach((node: any) =>
        n.body.data.nodes.update({
          id: node.id,
          color: "#6366f1",
        })
      );
    };

    const addEdge = (from: string, to: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      const id = `${from}->${to}`;
      if (!n.body.data.edges.get(id)) {
        n.body.data.edges.add({
          id,
          from,
          to,
          color: "#22c55e",
          width: 3.5,
        } as Edge);
      }
    };

    // --- Initialisation du graphe (positions physiques normales)
    useEffect(() => {
      if (!containerRef.current || !bfsResult) return;

      const nodes = G.nodes.map((city: string) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));

      // On ne met AUCUNE arête au départ
      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges: [] },
        {
          nodes: { shape: "dot", size: 22, borderWidth: 2 },
          edges: { arrows: { to: false }, smooth: true },
          physics: {
            enabled: true,
            solver: "forceAtlas2Based",
            stabilization: { iterations: 200 },
          },
          interaction: { hover: true },
        }
      );

      orderRef.current = bfsResult.order || [];
      parentsRef.current = bfsResult.parents || {};

      setIsFinished(false);
      setPlaying(false);
      setCurrentIndex(0);
      clearTimer();
      resetAll();

      onSummaryChange?.({ algo: "BFS (arbre libre)", order: orderRef.current, start });
      onLog?.(`BFS initialisé depuis ${start}`);

      // couleur du point de départ
      if (orderRef.current.length > 0) {
        const first = orderRef.current[0];
        (networkRef.current as any).body.data.nodes.update({
          id: first,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });
      }

      setPlaying(true);

      return () => {
        clearTimer();
        networkRef.current?.destroy();
        networkRef.current = null;
      };
    }, [bfsResult, start]);

    // --- Étape d’animation
    const runStep = (i: number) => {
      const n: any = networkRef.current;
      const order = orderRef.current;
      const parents = parentsRef.current;
      if (!n || i <= 0 || i >= order.length) return;

      const prev = order[i - 1];
      const current = order[i];
      const parent = parents[current];

      // prev devient visité
      n.body.data.nodes.update({
        id: prev,
        color: { background: "#6366f1", border: "#4f46e5" },
      });

      // on crée l’arête (parent, current)
      if (parent) {
        addEdge(parent, current);
        onLog?.(`Nouvelle connexion : ${parent} → ${current}`);
      }

      n.body.data.nodes.update({
        id: current,
        color: { background: "#a5b4fc", border: "#6366f1" },
      });

      setCurrentIndex(i);
      if (i === order.length - 1) {
        setIsFinished(true);
        setPlaying(false);
        onLog?.("✅ BFS terminé !");
      }
    };

    // --- Animation automatique
    useEffect(() => {
      clearTimer();
      if (!playing) return;
      let idx = currentIndex;
      intervalRef.current = window.setInterval(() => {
        const order = orderRef.current;
        if (idx + 1 < order.length) {
          runStep(idx + 1);
          idx++;
        } else {
          clearTimer();
          setIsFinished(true);
          setPlaying(false);
        }
      }, STEP_MS);
      return clearTimer;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing]);

    // --- Contrôles
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!isFinished && !playing) {
          setPlaying(true);
          onLog?.("▶️ Lecture BFS");
        }
      },
      pause: () => {
        clearTimer();
        setPlaying(false);
        onLog?.("⏸️ Pause BFS");
      },
      reset: () => {
        clearTimer();
        setPlaying(false);
        setCurrentIndex(0);
        resetAll();
        if (orderRef.current.length > 0) {
          const first = orderRef.current[0];
          (networkRef.current as any).body.data.nodes.update({
            id: first,
            color: { background: "#a5b4fc", border: "#6366f1" },
          });
        }
        setIsFinished(false);
        onLog?.("↺ Réinitialisation BFS");
      },
      step: () => {
        const order = orderRef.current;
        const next = Math.min(currentIndex + 1, Math.max(order.length - 1, 0));
        if (next !== currentIndex) {
          runStep(next);
          onLog?.(`Étape ${next}/${order.length - 1}`);
        }
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
        <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16, mb: 2 }}>
          BFS — Construction de l’arbre dans l’espace
        </Typography>

        <Paper
          ref={containerRef}
          elevation={6}
          sx={{
            height: 460,
            width: "100%",
            maxWidth: 760,
            border: "2px solid #cbd5e1",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        />

        {isFinished && (
          <Button
            startIcon={<ReplayIcon />}
            sx={{ mt: 2, textTransform: "none", color: "black" }}
            onClick={() => {
              resetAll();
              setPlaying(true);
              setIsFinished(false);
              setCurrentIndex(0);
              onLog?.("🔁 Rejouer BFS");
            }}
          >
            Rejouer
          </Button>
        )}
      </Box>
    );
  }
);

export default BFSGraphAnimation;
