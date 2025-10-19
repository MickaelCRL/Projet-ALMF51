import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeKruskalAsync(graph: Graph) {
  const response = await api.post("/kruskal", graph);
  return response.data;
}
