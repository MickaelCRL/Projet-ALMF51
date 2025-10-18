import { Box, Typography } from "@mui/material";
import useSWR from "swr";
import GraphAnimation from "../components/bfs/GraphAnimation";
import GraphNode from "../components/GraphNode";
import { graph } from "../data/graph";
import { getBFSAsync } from "../services/bfsService";

function Parcours() {
  const start = "Rennes";

  const { data } = useSWR([graph, start], ([graph, start]) =>
    getBFSAsync(graph, start)
  );
  console.log(data);
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
          Algorithmes de Graphes
        </Typography>
      </Box>
      <div style={{ display: "flex" }}>
        <GraphNode />
        <GraphAnimation />
      </div>
    </>
  );
}

export default Parcours;
