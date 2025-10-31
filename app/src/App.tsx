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
import Lab from "./pages/Lab"
import useSWR from "swr";
import { graph } from "./data/graph";
import { computeFloydWarshallAsync } from "./services/floydWarshall";

function App() {
/*  const { data: floydwarshall } = useSWR(["floydwarshall", graph], () =>
    computeFloydWarshallAsync(graph)
  );

  if (!floydwarshall) return <div>Loading...</div>;

  const { distances, next, nodes } = floydwarshall;

  return (
    <TableContainer component={Paper} style={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>From / To</TableCell>
            {nodes.map((n: any, index: any) => (
              <TableCell key={index} align="center">
                {n}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(nodes as string[]).map((fromNode, i) => (
            <TableRow key={fromNode}>
              <TableCell component="th" scope="row">
                {fromNode}
              </TableCell>
              {(nodes as string[]).map((_, j) => (
                <TableCell key={j} align="center">
                  <Typography variant="body2">{distances[i][j]}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    → {next[i][j]}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );*/
  return(
    <>
      <Lab></Lab>
    </>
  )
}
export default App;
