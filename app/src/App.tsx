import useSWR from "swr";
import { getKruskalAsync } from "./services/kruskalService";
import { graph } from "./data/graph";

function App() {
  const { data: kruskalResult } = useSWR(["kruskal", graph], () =>
    getKruskalAsync(graph)
  );

  console.log(kruskalResult);
  return <></>;
}

export default App;
