import type { Graph } from "../models/Graph";

export const graph: Graph = {
  nodes: [
    "Rennes",
    "Nantes",
    "Bordeaux",
    "Caen",
    "Paris",
    "Lille",
    "Nancy",
    "Dijon",
    "Lyon",
    "Grenoble",
  ],
  edges: [
    { from: "Rennes", to: "Nantes", weight: 45 },
    { from: "Rennes", to: "Caen", weight: 75 },
    { from: "Rennes", to: "Paris", weight: 110 },
    { from: "Rennes", to: "Bordeaux", weight: 130 },

    { from: "Nantes", to: "Paris", weight: 80 },
    { from: "Nantes", to: "Bordeaux", weight: 90 },

    { from: "Caen", to: "Paris", weight: 50 },
    { from: "Caen", to: "Lille", weight: 65 },

    { from: "Paris", to: "Lille", weight: 70 },
    { from: "Paris", to: "Dijon", weight: 60 },
    { from: "Paris", to: "Nancy", weight: 120 },
    { from: "Paris", to: "Bordeaux", weight: 150 },

    { from: "Lille", to: "Nancy", weight: 100 },

    { from: "Nancy", to: "Dijon", weight: 75 },
    { from: "Nancy", to: "Grenoble", weight: 80 },
    { from: "Nancy", to: "Lyon", weight: 90 },

    { from: "Dijon", to: "Lyon", weight: 70 },
    { from: "Dijon", to: "Grenoble", weight: 75 },

    { from: "Lyon", to: "Grenoble", weight: 40 },

    { from: "Bordeaux", to: "Lyon", weight: 100 },
  ],
};
