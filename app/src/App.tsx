import useSWR from "swr";
import { graph } from "./data/graph";
import { getBFSAsync } from "./services/bfsService";

function App() {
  const start = "Rennes";

  const { data } = useSWR([graph, start], ([graph, start]) =>
    getBFSAsync(graph, start)
  );
  console.log(data);

  return <></>;
}

export default App;
