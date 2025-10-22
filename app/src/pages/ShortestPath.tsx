import { Box, Typography } from "@mui/material";
import GraphNode from "../components/GraphNode";
import DjikstraGraphAnimation from "../components/djikstra/DjikstraGraphAnimation";

function ShortestPath() {
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
          Plus court chemin
        </Typography>
      </Box>
      <div style={{ display: "flex" }}>
        
        <GraphNode />
        <DjikstraGraphAnimation />
      </div>
      
    </>
  );
}
export default ShortestPath;