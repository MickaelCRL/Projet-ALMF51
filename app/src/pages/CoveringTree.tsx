import { Box, Typography } from "@mui/material";
import GraphNode from "../components/GraphNode";

// Adapte ces chemins si tes fichiers sont ailleurs
import PrimGraphAnimation from "../components/prim/PrimGraphAnimation";
import KruskalGraphAnimation from "../components/kruskal/KruskalGraphAnimation";

function CoveringTree() {
  return (
    <>
      <Box textAlign="center" mb={1} mt={2}>
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
          Arbres couvrants (ACPM)
        </Typography>
      </Box>

      <div style={{ display: "flex" }}>
        <GraphNode />
        <PrimGraphAnimation />
      </div>

      <div style={{ display: "flex", marginTop: "20px" }}>
        <GraphNode />
        <KruskalGraphAnimation />
      </div>
    </>
  );
}

export default CoveringTree;
