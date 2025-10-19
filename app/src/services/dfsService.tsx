import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeDFSAsync(graph: Graph, start: string) {
  const response = await api.post("/dfs", {
    graph,
    start,
  });

  return response.data;
}
