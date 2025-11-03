import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Lab from "./pages/Lab";
import useSWR from "swr";
import { graph } from "./data/graph";
import { graphN } from "./data/graphNegative";

import { computeFloydWarshallAsync } from "./services/floydWarshallService";
import { computeBellmanFordAsync } from "./services/bellmanFordService";

function App() {

  const start = "Rennes";
  const startNegative = "s1";
  const { data: bellmanford } = useSWR(["bellmanford", graph, start], () =>
    computeBellmanFordAsync(graph, start)
  );

  const { data: bellmanfordWithNegative } = useSWR(
    ["bellmanfordWithNegative", graphN, startNegative],
    () => computeBellmanFordAsync(graphN, startNegative)

  );

  console.log("bellmanford", bellmanford);
  console.log("bellmanfordWithNegative", bellmanfordWithNegative);

  const { data: floydwarshall } = useSWR(["floydwarshall", graph], () =>
    computeFloydWarshallAsync(graph)
  );

  if (!floydwarshall) return <div>Loading...</div>;

  const { distances, next, nodes } = floydwarshall;

 return(
    <>
      <Lab></Lab>
    </>
  );
}
export default App;
