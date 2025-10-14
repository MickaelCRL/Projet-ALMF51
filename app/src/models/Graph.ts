import type { Edge } from "./Edge";
import type { Node } from "./Node";

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}
