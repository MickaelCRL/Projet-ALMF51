import type { Graph } from "../models/Graph";

export const graphNegative: Graph = {
  nodes: ["s1", "s2", "s3", "s4", "s5", "s6"],
  edges: [
    { from: "s1", to: "s2", weight: 4 },
    { from: "s1", to: "s5", weight: 7 },
    { from: "s2", to: "s3", weight: 3 },
    { from: "s2", to: "s6", weight: 5 },
    { from: "s3", to: "s4", weight: 3 },
    { from: "s3", to: "s5", weight: 2 },
    { from: "s3", to: "s6", weight: 6 },
    { from: "s5", to: "s2", weight: -4 },
    { from: "s5", to: "s3", weight: -1 },
    { from: "s5", to: "s6", weight: 3 },
    { from: "s6", to: "s3", weight: -2 },
    { from: "s6", to: "s4", weight: 2 },
  ],
  isOriented: true,
};
