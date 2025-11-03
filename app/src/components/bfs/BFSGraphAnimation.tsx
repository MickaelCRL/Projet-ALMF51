// BFSGraphAnimation.tsx
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Network, type Edge } from "vis-network/standalone";
import { Box, Paper, Typography, Button, Chip, Stack } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { computeBFSAsync } from "../../services/bfsService";
import { graph } from "../../data/graph";

const STEP_MS = 800;

type ParentsMap = Record<string, string | null>;

type BFSProps = {
  /** Sommet demandé par le parent */
  start: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (message: string) => void;
};

export type BFSHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

// -- duplique les arêtes dans les 2 sens (graphe non orienté pour l’API)
function expandUndirected<G extends { edges: any[] }>(g: G): G {
  const edges: any[] = [];
  const seen = new Set<string>();
  for (const e of g.edges) {
    const k1 = `${e.from}|${e.to}`;
    const k2 = `${e.to}|${e.from}`;
    if (!seen.has(k1)) {
      edges.push({ ...e });
      seen.add(k1);
    }
    if (!seen.has(k2)) {
      edges.push({ from: e.to, to: e.from, weight: e.weight });
      seen.add(k2);
    }
  }
  return { ...(g as any), edges, isOriented: false };
}

const BFSGraphAnimation = forwardRef<BFSHandle, BFSProps>(
  ({ start, onSummaryChange, onLog }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);

    // état d'animation
    const [isFinished, setIsFinished] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // verrouillage de changement de sommet : on conserve un "start actif"
    const [activeStart, setActiveStart] = useState(start);
    const [queuedStart, setQueuedStart] = useState<string | null>(null);

    // données graphe & BFS
    const G = useRef(expandUndirected(graph)).current;
    const orderRef = useRef<string[]>([]);
    const parentsRef = useRef<ParentsMap>({});

    // timer + token anti-zombies
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const runTokenRef = useRef(0);

    const clearTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const ensureNetwork = () => {
      if (networkRef.current || !containerRef.current) return;
      networkRef.current = new Network(
        containerRef.current,
        { nodes: [], edges: [] },
        {
          nodes: { shape: "dot", size: 22, borderWidth: 2 },
          edges: { arrows: { to: false }, smooth: true },
          physics: {
            enabled: true,
            solver: "forceAtlas2Based",
            stabilization: { iterations: 200 },
          },
          interaction: { hover: true },
        }
      );
    };

    const setGraphNodesOnly = () => {
      const n: any = networkRef.current;
      if (!n) return;
      const nodes = G.nodes.map((city: string) => ({
        id: city,
        label: city,
        color: "#6366f1",
      }));
      n.setData({ nodes, edges: [] }); // reset data propre
    };

    const resetVisual = () => {
      const n: any = networkRef.current;
      if (!n) return;
      // supprime toutes les arêtes
      const allEdges = n.body.data.edges.get().map((e: any) => e.id);
      n.body.data.edges.remove(allEdges);
      // remet la couleur des nœuds
      n.body.data.nodes.get().forEach((node: any) =>
        n.body.data.nodes.update({ id: node.id, color: "#6366f1" })
      );
    };

    const addEdge = (from: string, to: string) => {
      const n: any = networkRef.current;
      if (!n) return;
      const id = `${from}->${to}`;
      if (!n.body.data.edges.get(id)) {
        n.body.data.edges.add({
          id,
          from,
          to,
          color: "#22c55e",
          width: 3.5,
        } as Edge);
      }
    };

    // Init/destroy du Network (une seule fois)
    useEffect(() => {
      ensureNetwork();
      return () => {
        clearTimer();
        networkRef.current?.destroy();
        networkRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔒 Verrou de changement de sommet :
    // si le parent change `start` pendant l'animation, on le met en attente
    useEffect(() => {
      if (start === activeStart) return;
      if (playing) {
        setQueuedStart(start);
        onLog?.(`🔒 Changement de sommet "${start}" mis en attente (animation en cours).`);
      } else {
        setActiveStart(start); // appliqué immédiatement si pas en lecture
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start]);

    // applique un start (actif OU en attente) → relance BFS
    const applyStartAndRun = async (s: string) => {
      const token = ++runTokenRef.current; // invalide les anciennes runs
      clearTimer();
      setPlaying(false);
      setIsFinished(false);
      setCurrentIndex(0);

      ensureNetwork();
      setGraphNodesOnly();
      resetVisual();

      try {
        const bfs = await computeBFSAsync(G as any, s);
        if (token !== runTokenRef.current) return; // annulé

        orderRef.current = bfs.order || [];
        parentsRef.current = bfs.parents || {};

        onSummaryChange?.({
          algo: "BFS (arbre libre)",
          order: orderRef.current,
          start: s,
        });
        onLog?.(`BFS initialisé depuis ${s}`);

        // colorier le premier
        const n: any = networkRef.current;
        if (orderRef.current.length > 0) {
          n?.body.data.nodes.update({
            id: orderRef.current[0],
            color: { background: "#a5b4fc", border: "#6366f1" },
          });
        }

        // lancer l’anim uniquement si on a au moins 2 nœuds
        if (orderRef.current.length > 1) {
          setPlaying(true);
        } else {
          setIsFinished(true);
          setPlaying(false);
        }
      } catch (e) {
        onLog?.(`❌ Erreur BFS: ${(e as Error).message}`);
        setIsFinished(true);
      }
    };

    // (Re)lancer BFS quand activeStart change réellement
    useEffect(() => {
      applyStartAndRun(activeStart);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStart]);

    // Quand l'animation s'arrête (pause ou fin), si un start est en attente, on l'applique
    useEffect(() => {
      if (!playing && queuedStart && queuedStart !== activeStart) {
        onLog?.(`✅ Application du sommet en attente "${queuedStart}".`);
        setActiveStart(queuedStart);
        setQueuedStart(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing]);

    const runStep = (i: number) => {
      const activeToken = runTokenRef.current;
      const n: any = networkRef.current;
      const order = orderRef.current;
      const parents = parentsRef.current;

      if (!n || i <= 0 || i >= order.length) return;
      if (activeToken !== runTokenRef.current) return; // annulé

      const prev = order[i - 1];
      const current = order[i];
      const parent = parents[current];

      // prev devient visité
      n.body.data.nodes.update({
        id: prev,
        color: { background: "#6366f1", border: "#4f46e5" },
      });

      if (parent) {
        addEdge(parent, current);
        onLog?.(`Nouvelle connexion : ${parent} → ${current}`);
      }

      // current en surbrillance
      n.body.data.nodes.update({
        id: current,
        color: { background: "#a5b4fc", border: "#6366f1" },
      });

      setCurrentIndex(i);
      if (i === order.length - 1) {
        setIsFinished(true);
        setPlaying(false);
        onLog?.("✅ BFS terminé !");
      }
    };

    // Boucle d’animation
    useEffect(() => {
      clearTimer();
      if (!playing) return;

      const token = ++runTokenRef.current; // nouveau cycle
      let idx = currentIndex;

      intervalRef.current = setInterval(() => {
        if (token !== runTokenRef.current) return; // zombie
        const order = orderRef.current;
        if (idx + 1 < order.length) {
          runStep(idx + 1);
          idx++;
        } else {
          clearTimer();
          setIsFinished(true);
          setPlaying(false);
        }
      }, STEP_MS);

      return clearTimer;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing]);

    // API exposée au parent
    useImperativeHandle(ref, () => ({
      play: () => {
        if (!isFinished && !playing) {
          setPlaying(true);
          onLog?.("▶️ Lecture BFS");
        }
      },
      pause: () => {
        clearTimer();
        setPlaying(false);
        onLog?.("⏸️ Pause BFS");
      },
      reset: () => {
        runTokenRef.current++; // invalide
        clearTimer();
        setPlaying(false);
        setCurrentIndex(0);
        resetVisual();

        const order = orderRef.current;
        if (order.length > 0) {
          (networkRef.current as any)?.body.data.nodes.update({
            id: order[0],
            color: { background: "#a5b4fc", border: "#6366f1" },
          });
        }
        setIsFinished(order.length <= 1);
        onLog?.("↺ Réinitialisation BFS");
      },
      step: () => {
        const order = orderRef.current;
        const next = Math.min(currentIndex + 1, Math.max(order.length - 1, 0));
        if (next !== currentIndex) {
          runStep(next);
          onLog?.(`Étape ${next}/${order.length - 1}`);
        }
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: { xs: 3, md: 5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body1" sx={{ color: "#64748b", fontSize: 16 }}>
            BFS — Construction de l’arbre dans l’espace
          </Typography>
          {playing && <Chip label="Animation en cours (verrouillée)" size="small" />}
          {!playing && queuedStart && (
            <Chip label={`En attente: ${queuedStart}`} size="small" variant="outlined" />
          )}
        </Stack>

        <Paper
          ref={containerRef}
          elevation={6}
          sx={{
            height: 460,
            width: "100%",
            maxWidth: 760,
            border: "2px solid #cbd5e1",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
          }}
        />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              if (!isFinished && !playing) setPlaying(true);
            }}
            disabled={playing || isFinished}
            sx={{ textTransform: "none", color: "black" }}
          >
            Lire
          </Button>
          <Button
            startIcon={<PauseIcon />}
            onClick={() => setPlaying(false)}
            disabled={!playing}
            sx={{ textTransform: "none", color: "black" }}
          >
            Pause
          </Button>
          <Button
            startIcon={<ReplayIcon />}
            onClick={() => {
              runTokenRef.current++;
              clearTimer();
              setPlaying(false);
              setIsFinished(false);
              setCurrentIndex(0);
              resetVisual();

              const order = orderRef.current;
              if (order.length > 0) {
                (networkRef.current as any)?.body.data.nodes.update({
                  id: order[0],
                  color: { background: "#a5b4fc", border: "#6366f1" },
                });
              }
              if (order.length > 1) setPlaying(true);
              onLog?.("🔁 Rejouer BFS");
            }}
            sx={{ textTransform: "none", color: "black" }}
          >
            Rejouer
          </Button>
        </Stack>

        <Typography variant="caption" sx={{ mt: 1, color: "#64748b" }}>
          Sommet actif : <b>{activeStart}</b>
          {queuedStart && playing && <> — (nouveau sommet <b>{queuedStart}</b> en attente)</>}
        </Typography>

        {isFinished && (
          <Button
            startIcon={<ReplayIcon />}
            sx={{ mt: 2, textTransform: "none", color: "black" }}
            onClick={() => {
              runTokenRef.current++;
              clearTimer();
              setPlaying(false);
              setIsFinished(false);
              setCurrentIndex(0);
              resetVisual();

              const order = orderRef.current;
              if (order.length > 0) {
                (networkRef.current as any)?.body.data.nodes.update({
                  id: order[0],
                  color: { background: "#a5b4fc", border: "#6366f1" },
                });
              }
              if (order.length > 1) setPlaying(true);
              onLog?.("🔁 Rejouer BFS");
            }}
          >
            Rejouer
          </Button>
        )}
      </Box>
    );
  }
);

export default BFSGraphAnimation;
