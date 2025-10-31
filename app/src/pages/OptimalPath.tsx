
import { Box, Typography } from "@mui/material";
import BFSGraphAnimation from "../components/bfs/BFSGraphAnimation";
import DFSGraphAnimation from "../components/dfs/DFSGraphAnimation";
import GraphNode from "../components/GraphNode";

function Traversal() {
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
          Parcours de Graphes
        </Typography>
      </Box>
      <div style={{ display: "flex" }}>
        <GraphNode />
        <BFSGraphAnimation />
      </div>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <GraphNode />
        <DFSGraphAnimation />
      </div>
    </>
  );
}

export default Traversal;
