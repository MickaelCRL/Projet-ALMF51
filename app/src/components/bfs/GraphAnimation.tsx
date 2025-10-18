import { useEffect, useRef, useState } from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import useSWR from "swr";
import { getBFSAsync } from "../../services/bfsService";
import { graph } from "../../data/graph";

type ParentsMap = Record<string, string | null>;

export default function GraphAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const start = "Rennes";
  const { data } = useSWR([graph, start], ([graph, start]) =>
    getBFSAsync(graph, start)
  );

  const runAnimation = () => {
    if (!networkRef.current || !data) return;

    const { order, parents } = data as { order: string[]; parents: ParentsMap };
    const network = networkRef.current as any;

    network.body.data.nodes.get().forEach((n: any) =>
      network.body.data.nodes.update({
        id: n.id,
        color: "#6366f1",
      })
    );
    network.body.data.edges
      .get()
      .forEach((e: any) =>
        network.body.data.edges.update({ id: e.id, color: "#64748b" })
      );

    setIsFinished(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index > 0) {
        const prev = order[index - 1];
        network.body.data.nodes.update({
          id: prev,
          color: { background: "#6366f1", border: "#4f46e5" },
        });

        const parent = parents[order[index]];
        if (parent) {
          const edgeId = `${parent}->${order[index]}`;
          network.body.data.edges.update({ id: edgeId, color: "#64748b" });
        }
      }

      if (index < order.length) {
        const current = order[index];
        network.body.data.nodes.update({
          id: current,
          color: { background: "#a5b4fc", border: "#6366f1" },
        });

        const parent = parents[current];
        if (parent) {
          const edgeId = `${parent}->${current}`;
          network.body.data.edges.update({ id: edgeId, color: "red" });
        }

        index++;
      } else {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const nodes = graph.nodes.map((city) => ({
      id: city,
      label: city,
      color: "#6366f1",
    }));

    const edges: Edge[] = Object.entries(data.parents)
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

    runAnimation();
  }, [data]);

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
          onClick={runAnimation}
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
