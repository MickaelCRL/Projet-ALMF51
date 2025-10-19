import api from "../api";
import type { Graph } from "../models/Graph";

export async function computePrimAsync(graph: Graph, start: string) {
  const response = await api.post("/prim", {
    graph,
    start,
  });

  return response.data;
}
