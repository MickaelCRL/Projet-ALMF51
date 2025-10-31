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

type ParentsMap = Record<string, string | null>;

// ✅ props supplémentaires : onSummaryChange, onLog
type BFSProps = {
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (message: string) => void;
};

// ✅ ref exposée à la barre commune
export type BFSHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const BFSGraphAnimation = forwardRef<BFSHandle, BFSProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);

    const [isFinished, setIsFinished] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [order, setOrder] = useState<string[]>([]);
    const [parents, setParents] = useState<ParentsMap>({});
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Récupération des données via SWR
    const { data: bfsResult } = useSWR(["bfs", graph, start], () =>
      computeBFSAsync(graph, start)
    );

    // --- Initialisation du graphe ---
    useEffect(() => {
      if (!containerRef.current || !bfsResult) return;

      const nodes = graph.nodes.map((city) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));

      const edges: Edge[] = Object.entries(bfsResult.parents)
        .filter(([_, parent]) => parent !== null)
        .map(([child, parent]) => ({
          id: `${parent}->${child}`,
          from: parent as string,
          to: child as string,
          color: "#64748b",
        }));

      const options = {
        nodes: { shape: "dot", size: 22, borderWidth: 2 },
        edges: {
          arrows: { to: true },
          width: 2.5,
          smooth: { enabled: true, type: "cubicBezier", roundness: 0.4 },
        },
        physics: { enabled: true },
      };

      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges },
        options
      );

      setOrder(bfsResult.order);
      setParents(bfsResult.parents);
      setIsFinished(false);
      setCurrentIndex(0);

      // ✅ résumé et log initiaux
      onSummaryChange?.({
        algo: "BFS",
        order: bfsResult.order,
        start,
      });
      onLog?.(`BFS initialisé à partir de ${start}.`);

      runStep(0); // coloration du premier nœud
    }, [bfsResult]);

    // --- Étape unique ---
    const runStep = (i: number) => {
      if (!networkRef.current || !bfsResult) return;
      const network = networkRef.current as any;

      if (i === 0) {
        const first = order[0];
        network.body.data.nodes.update({
          id: first,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });
        onLog?.(`Départ depuis ${first}.`);
        return;
      }

      if (i < order.length) {
        const prev = order[i - 1];
        const current = order[i];
        const parent = parents[current];

        network.body.data.nodes.update({
          id: prev,
          color: { background: "#6366f1", border: "#4f46e5" },
        });

        network.body.data.nodes.update({
          id: current,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });

        if (parent) {
          const edgeId = `${parent}->${current}`;
          network.body.data.edges.update({ id: edgeId, color: "red" });
          onLog?.(`Découverte : ${parent} → ${current}`);
        }

        setCurrentIndex(i);
      } else {
        setIsFinished(true);
        setPlaying(false);
        onLog?.("BFS terminé ✅");
      }
    };

    // --- Animation automatique ---
    useEffect(() => {
      if (!playing) {
        if (intervalId) clearInterval(intervalId);
        return;
      }

      const id = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          runStep(next);
          if (next >= order.length) {
            clearInterval(id);
            setIsFinished(true);
            setPlaying(false);
          }
          return next;
        });
      }, 1000);

      setIntervalId(id);
      return () => clearInterval(id);
    }, [playing]);

    // --- Expose les contrôles pour la barre commune ---
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!isFinished && !playing) {
          setPlaying(true);
          onLog?.("▶️ Lecture BFS");
        }
      },
      pause: () => {
        setPlaying(false);
        onLog?.("⏸️ Pause BFS");
      },
      reset: () => {
        setPlaying(false);
        setCurrentIndex(0);
        if (networkRef.current) {
          networkRef.current.body.data.nodes.get().forEach((n: any) =>
            networkRef.current!.body.data.nodes.update({
              id: n.id,
              color: "#6366f1",
            })
          );
          networkRef.current.body.data.edges
            .get()
            .forEach((e: any) =>
              networkRef.current!.body.data.edges.update({
                id: e.id,
                color: "#64748b",
              })
            );
        }
        setIsFinished(false);
        onLog?.("↺ Réinitialisation du BFS");
        runStep(0);
      },
      step: () => {
        const next = currentIndex + 1;
        runStep(next);
        setCurrentIndex(next);
        onLog?.(`⏭ Étape suivante (${next}/${order.length})`);
      },
    }));

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ p: { xs: 3, md: 5 } }}
      >
        <Typography
          variant="body1"
          sx={{
            color: "#64748b",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "16px",
            mb: 2,
          }}
        >
          Parcours BFS du graphe
        </Typography>

        <Paper
          ref={containerRef}
          elevation={6}
          sx={{
            height: "400px",
            width: "100%",
            maxWidth: "600px",
            border: "2px solid #cbd5e1",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        />

        {isFinished && (
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setPlaying(false);
              runStep(0);
              onLog?.("🔁 Rejouer BFS");
            }}
            startIcon={<ReplayIcon />}
            sx={{
              mt: 2,
              textTransform: "none",
              fontSize: "16px",
              color: "black",
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
