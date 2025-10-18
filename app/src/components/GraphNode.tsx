import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";
import { graph } from "../data/graph";

export default function GraphNode() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = graph.nodes.map((city) => ({
      id: city,
      label: city,
      color: {
        background: "#6366f1",
        border: "#4f46e5",
        highlight: { background: "#818cf8", border: "#6366f1" },
      },
    }));

    const edges = graph.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.weight.toString(),
      color: { color: "#64748b", highlight: "#6366f1" },
    }));

    const options = {
      nodes: {
        shape: "dot",
        size: 22,
        borderWidth: 2,
        font: {
          color: "#0f172a",
          size: 15,
          face: "Inter, system-ui, sans-serif",
          background: "rgba(255, 255, 255, 0.95)",
          strokeWidth: 0,
        },
      },
      edges: {
        width: 2.5,
        smooth: { enabled: true, type: "dynamic", roundness: 0.5 },
        font: {
          align: "top",
          size: 13,
          color: "#334155",
          background: "rgba(255,255,255,0.9)",
          strokeWidth: 0,
        },
      },
      physics: {
        enabled: true,
        solver: "forceAtlas2Based",
        stabilization: { iterations: 150 },
      },
      interaction: { hover: true, zoomView: true, dragView: true },
    };

    const network = new Network(
      containerRef.current,
      { nodes, edges },
      options
    );

    return () => network.destroy();
  }, []);

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
        Visualisation du graphe
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
    </Box>
  );
}
