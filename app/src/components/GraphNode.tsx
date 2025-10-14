import { useEffect, useRef, useState } from "react";

const GraphNode: React.FC = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(null);
  const edgesRef = useRef(null);

  const [src, setSrc] = useState("Rennes");
  const [dst, setDst] = useState("Lille");

  useEffect(() => {
    const nodes = new vis.DataSet([
      { id: "Rennes", label: "Rennes" },
      { id: "Caen", label: "Caen" },
      { id: "Lille", label: "Lille" },
      { id: "Paris", label: "Paris" },
      { id: "Lyon", label: "Lyon" },
      { id: "Bordeaux", label: "Bordeaux" },
      { id: "Nantes", label: "Nantes" },
      { id: "Dijon", label: "Dijon" },
      { id: "Nancy", label: "Nancy" },
      { id: "Grenoble", label: "Grenoble" },
    ]);

    const edges = new vis.DataSet([
      { id: "Rennes-Caen", from: "Rennes", to: "Caen", label: "75", width: 2 },
      { id: "Caen-Lille", from: "Caen", to: "Lille", label: "65", width: 2 },
      { id: "Rennes-Paris", from: "Rennes", to: "Paris", label: "110", width: 2 },
      { id: "Paris-Caen", from: "Paris", to: "Caen", label: "50", width: 2 },
      { id: "Paris-Lille", from: "Paris", to: "Lille", label: "70", width: 2 },
      { id: "Paris-Dijon", from: "Paris", to: "Dijon", label: "60", width: 2 },
      { id: "Rennes-Nantes", from: "Rennes", to: "Nantes", label: "45", width: 2 },
      { id: "Nantes-Paris", from: "Nantes", to: "Paris", label: "80", width: 2 },
      { id: "Nantes-Bordeaux", from: "Nantes", to: "Bordeaux", label: "90", width: 2 },
      { id: "Rennes-Bordeaux", from: "Rennes", to: "Bordeaux", label: "130", width: 2 },
      { id: "Bordeaux-Paris", from: "Bordeaux", to: "Paris", label: "150", width: 2 },
      { id: "Bordeaux-Lyon", from: "Bordeaux", to: "Lyon", label: "100", width: 2 },
      { id: "Lille-Nancy", from: "Lille", to: "Nancy", label: "100", width: 2 },
      { id: "Lille-Dijon", from: "Lille", to: "Dijon", label: "120", width: 2 },
      { id: "Dijon-Nancy", from: "Dijon", to: "Nancy", label: "75", width: 2 },
      { id: "Dijon-Grenoble", from: "Dijon", to: "Grenoble", label: "75", width: 2 },
      { id: "Grenoble-Nancy", from: "Grenoble", to: "Nancy", label: "80", width: 2 },
      { id: "Lyon-Nancy", from: "Lyon", to: "Nancy", label: "90", width: 2 },
      { id: "Dijon-Lyon", from: "Dijon", to: "Lyon", label: "70", width: 2 },
      { id: "Lyon-Grenoble", from: "Lyon", to: "Grenoble", label: "40", width: 2 },
    ]);

    const options = {
      physics: { enabled: true, solver: "forceAtlas2Based", stabilization: { iterations: 150 } },
      nodes: { shape: "dot", size: 16, color: { background: "#60a5fa", border: "#fff" } },
      edges: { color: "#94a3b8", font: { align: "top" }, smooth: { type: "dynamic" } },
      interaction: { hover: true, navigationButtons: true, keyboard: true },
    };

    const net = new vis.Network(containerRef.current, { nodes, edges }, options);

    networkRef.current = net;
    nodesRef.current = nodes;
    edgesRef.current = edges;

    return () => net?.destroy();
  }, []);

  return (
    <div className="app-container">
      <div className="navbar">
        <div className="navbar-title">Projet Graphe — vis-network</div>
      </div>

      <div className="graph-container">
        <div id="vis" ref={containerRef} className="graph" />
      </div>
    </div>
  );
}
export default GraphNode;