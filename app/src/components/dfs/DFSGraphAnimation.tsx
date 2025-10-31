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
import { computeDFSAsync } from "../../services/dfsService";
import { graph } from "../../data/graph";

type ParentsMap = Record<string, string | null>;

type DFSProps = {
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (message: string) => void;
};

export type DFSHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const DFSGraphAnimation = forwardRef<DFSHandle, DFSProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [order, setOrder] = useState<string[]>([]);
    const [parents, setParents] = useState<ParentsMap>({});
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const { data: dfsResult } = useSWR(["dfs", graph, start], () =>
      computeDFSAsync(graph, start)
    );

    // initialisation vis-network
    useEffect(() => {
      if (!containerRef.current || !dfsResult) return;

      const nodes = graph.nodes.map((city) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));

      const edges: Edge[] = graph.edges.map((e) => ({
        id: `${e.from}->${e.to}`,
        from: e.from,
        to: e.to,
        color: "#64748b",
      }));

      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges },
        {
          nodes: { shape: "dot", size: 22, borderWidth: 2 },
          edges: {
            arrows: { to: false },
            width: 2.5,
            smooth: { enabled: true, type: "cubicBezier", roundness: 0.4 },
          },
          physics: { enabled: true },
        }
      );

      const { order, parents } = dfsResult as {
        order: string[];
        parents: ParentsMap;
      };

      setOrder(order);
      setParents(parents);
      setIsFinished(false);
      setCurrentIndex(0);

      onSummaryChange?.({ algo: "DFS", order, start });
      onLog?.(`DFS initialisé à partir de ${start}`);
      runStep(0);
    }, [dfsResult]);

    // Étape unique
    const runStep = (i: number) => {
      if (!networkRef.current || !dfsResult) return;
      const network = networkRef.current as any;
      const { order, parents } = dfsResult as {
        order: string[];
        parents: ParentsMap;
      };

      if (i === 0) {
        const first = order[0];
        network.body.data.nodes.update({
          id: first,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });
        onLog?.(`Début du parcours à ${first}`);
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
          const edge = network.body.data.edges
            .get()
            .find(
              (e: any) =>
                (e.from === parent && e.to === current) ||
                (e.from === current && e.to === parent)
            );
          if (edge) {
            network.body.data.edges.update({ id: edge.id, color: "red" });
            onLog?.(`Visite ${parent} → ${current}`);
          }
        }
        setCurrentIndex(i);
      } else {
        setIsFinished(true);
        setPlaying(false);
        onLog?.("DFS terminé ✅");
      }
    };

    // animation automatique
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

    // expose les contrôles
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!isFinished && !playing) {
          setPlaying(true);
          onLog?.("▶️ Lecture DFS");
        }
      },
      pause: () => {
        setPlaying(false);
        onLog?.("⏸️ Pause DFS");
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
        onLog?.("↺ Réinitialisation du DFS");
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
          Parcours DFS du graphe
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
              onLog?.("🔁 Rejouer DFS");
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

export default DFSGraphAnimation;
