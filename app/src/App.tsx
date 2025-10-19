import useSWR from "swr";
import { computeKruskalAsync } from "./services/kruskalService";
import { graph } from "./data/graph";
import { computePrimAsync } from "./services/primService";

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

  return <></>;
}

export default App;
