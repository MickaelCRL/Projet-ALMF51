import useSWR from "swr";
import { computeKruskalAsync } from "./services/kruskalService";
import { graph } from "./data/graph";
import { computePrimAsync } from "./services/primService";
import { computeDijkstraAsync } from "./services/dijkstraService";
import { graphNegative } from "./data/graphNegative";
import { computeBellmanFordAsync } from "./services/bellmanFordService";

function App() {
  const { data: kruskalResult } = useSWR(["kruskal", graph], () =>
    computeKruskalAsync(graph)
  );

  console.log(kruskalResult);

  const start = "Rennes";
  const { data: primResult } = useSWR(["primResult", graph, start], () =>
    computePrimAsync(graph, start)
  );

  console.log(primResult);

  const target = "Lille";
  const { data: dijkstraResult } = useSWR(
    ["dijkstraResult", graph, start, target],
    () => computeDijkstraAsync(graph, start, target)
  );

  console.log(dijkstraResult);

  const { data: bellmanford } = useSWR(
    ["bellmanford", graphNegative, start, target],
    () => computeBellmanFordAsync(graphNegative, start, target)
  );

  console.log("bellmanford");
  console.log(bellmanford);

  return <></>;
}

export default App;
