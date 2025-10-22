import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeBellmanFordAsync(
  graph: Graph,
  start: string,
  target: string
) {
  const response = await api.post("/bellman-ford", {
    graph,
    start,
    target,
  });

  return response.data;
}
