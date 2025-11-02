import api from "../api";
import type { Graph } from "../models/Graph";

export async function computeFloydWarshallAsync(graph: Graph) {
  const response = await api.post("/floyd-warshall", graph);
  return response.data;
}
