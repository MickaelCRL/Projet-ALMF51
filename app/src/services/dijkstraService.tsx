import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeDijkstraAsync(
  graph: Graph,
  start: string,
  target: string
) {
  const response = await api.post("/dijkstra", {
    graph,
    start,
    target,
  });

  return response.data;
}
