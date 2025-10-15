import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";

function GraphNode() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes = [
      { id: "Rennes", label: "Rennes" },
      { id: "Caen", label: "Caen" },
      { id: "Lille", label: "Lille" },
      { id: "Paris", label: "Paris" },
      { id: "Lyon", label: "Lyon" },
      { id: "Bordeaux", label: "Bordeaux" },
      { id: "Nantes", label: "Nantes" },
      { id: "Dijon", label: "Dijon" },
      { id: "Nancy", label: "Nancy" },
      { id: "Grenoble", label: "Grenoble" },
    ];

    const edges = [
      { from: "Rennes", to: "Caen", label: "75" },
      { from: "Caen", to: "Lille", label: "65" },
      { from: "Rennes", to: "Paris", label: "110" },
      { from: "Paris", to: "Caen", label: "50" },
      { from: "Paris", to: "Lille", label: "70" },
      { from: "Paris", to: "Dijon", label: "60" },
      { from: "Rennes", to: "Nantes", label: "45" },
      { from: "Nantes", to: "Paris", label: "80" },
      { from: "Nantes", to: "Bordeaux", label: "90" },
      { from: "Rennes", to: "Bordeaux", label: "130" },
      { from: "Bordeaux", to: "Paris", label: "150" },
      { from: "Bordeaux", to: "Lyon", label: "100" },
      { from: "Lille", to: "Nancy", label: "100" },
      { from: "Lille", to: "Dijon", label: "120" },
      { from: "Dijon", to: "Nancy", label: "75" },
      { from: "Dijon", to: "Grenoble", label: "75" },
      { from: "Grenoble", to: "Nancy", label: "80" },
      { from: "Lyon", to: "Nancy", label: "90" },
      { from: "Dijon", to: "Lyon", label: "70" },
      { from: "Lyon", to: "Grenoble", label: "40" },
    ];

    const options = {
      nodes: {
        shape: "dot",
        size: 22,
        color: {
          background: "#6366f1",
          border: "#4f46e5",
          highlight: {
            background: "#818cf8",
            border: "#6366f1",
          },
        },
        font: {
          color: "#0f172a",
          size: 15,
          face: "Inter, system-ui, sans-serif",
          background: "rgba(255, 255, 255, 0.95)",
          strokeWidth: 0,
        },
        borderWidth: 2,
      },
      edges: {
        color: {
          color: "#64748b",
          highlight: "#6366f1",
        },
        width: 2.5,
        font: {
          align: "top",
          size: 13,
          color: "#334155",
          background: "rgba(255, 255, 255, 0.9)",
          strokeWidth: 0,
        },
        smooth: {
          enabled: true,
          type: "dynamic",
          roundness: 0.5,
        },
      },
      physics: {
        enabled: true,
        solver: "forceAtlas2Based",
        stabilization: { iterations: 150 },
      },
      interaction: {
        hover: true,
        zoomView: true,
        dragView: true,
      },
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
      sx={{
        p: { xs: 3, md: 5 },
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "#0f172a",
          mb: 1,
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: { xs: "28px", md: "32px" },
        }}
      >
        Algorithmes de Graphes
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#64748b",
          mb: 3,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
        }}
      >
        Visualisation du graphe
      </Typography>

      <Paper
        ref={containerRef}
        elevation={6}
        sx={{
          height: "600px",
          width: "100%",
          maxWidth: "1024px",
          border: "2px solid #cbd5e1",
          borderRadius: "16px",
          backgroundColor: "#ffffff",
        }}
      />
    </Box>
  );
}

export default GraphNode;
