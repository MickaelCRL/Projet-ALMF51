import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeBellmanFordAsync(graph: Graph, start: string) {
  const response = await api.post("/bellman-ford", {
    graph,
    start,
  });

  return response.data;
}
