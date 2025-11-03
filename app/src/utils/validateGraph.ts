// src/utils/validateGraph.ts
import type { Graph } from "../models/Graph";

export type GraphValidation =
  | { ok: true; graph: Graph }
  | { ok: false; error: string };

export function validateAndNormalizeGraph(input: any): GraphValidation {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Fichier JSON invalide." };
  }

  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  const edges = Array.isArray(input.edges) ? input.edges : [];
  const isOriented = Boolean(input.isOriented);

  // nodes: strings uniques
  const nodeSet = new Set<string>();
  for (const n of nodes) {
    if (typeof n !== "string" || !n.trim()) {
      return { ok: false, error: "Chaque 'node' doit être une chaîne non vide." };
    }
    nodeSet.add(n.trim());
  }
  const uniqueNodes = Array.from(nodeSet);

  // edges: {from,to,weight:number}
  const cleanEdges: Graph["edges"] = [];
  for (const e of edges) {
    if (!e || typeof e !== "object") {
      return { ok: false, error: "Une arête est invalide (type incorrect)." };
    }
    const from = String(e.from ?? "").trim();
    const to = String(e.to ?? "").trim();
    const wRaw = e.weight ?? e.w ?? e.cost;
    const weight = typeof wRaw === "string" ? Number(wRaw) : Number(wRaw);

    if (!from || !to) return { ok: false, error: "Une arête n'a pas 'from'/'to' valides." };
    if (!nodeSet.has(from) || !nodeSet.has(to)) {
      return { ok: false, error: `Arête (${from} → ${to}) utilise un sommet absent de 'nodes'.` };
    }
    if (!Number.isFinite(weight)) {
      return { ok: false, error: `Poids manquant ou non numérique pour (${from} → ${to}).` };
    }

    cleanEdges.push({ from, to, weight });
  }

  const graph: Graph = { nodes: uniqueNodes, edges: cleanEdges, isOriented };
  if (graph.nodes.length === 0) {
    return { ok: false, error: "Aucun sommet dans le graphe." };
  }
  return { ok: true, graph };
}
