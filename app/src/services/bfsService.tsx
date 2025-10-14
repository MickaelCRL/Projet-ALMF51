import api from "../api";
import type { Graph } from "../models/Graph";

export async function getBFSAsync(graph: Graph, start: string) {
  const response = await api.post("/bfs", {
    graph,
    start,
  });

  return response.data;
}
