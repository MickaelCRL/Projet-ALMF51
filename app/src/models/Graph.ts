import type { Edge } from "./Edge";

export interface Graph {
  nodes: string[];
  edges: Edge[];
  isOriented: boolean;
}
