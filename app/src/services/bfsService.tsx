import api from "../api";
import type { Graph } from "../models/Graph";
import type { Node } from "../models/Node";

export async function getBFSAsync(graph: Graph, start: Node) {
  const response = await api.post("/bfs", {
    graph,
    start: start.name,
  });

  return response.data;
}
