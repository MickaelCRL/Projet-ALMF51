import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Stack,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { computeFloydWarshallAsync } from "../../services/floydWarshallService";
import { graph } from "../../data/graph";

// même sentinelle que le backend C#
const INF = 1_000_000_000;

// ---------- Helpers ----------
type FWPayload = {
  Nodes?: string[];
  nodes?: string[];
  Distances?: number[][];
  distances?: number[][];
  Next?: (string | null)[][];
  next?: (string | null)[][];
};

function normalizeFW(res: FWPayload) {
  const nodes = (res.Nodes ?? res.nodes) ?? [];
  const distances = (res.Distances ?? res.distances) ?? [];
  const next = (res.Next ?? res.next) ?? [];
  return { nodes, distances, next };
}

function fmt(d?: number | null) {
  if (d == null || Number.isNaN(d)) return "∞";
  return d >= INF ? "∞" : String(d);
}

function toCSV(nodes: string[], distances: number[][]) {
  const header = ["", ...nodes].join(",");
  const rows = nodes.map((ri, i) => {
    const cells = nodes.map((_, j) => fmt(distances?.[i]?.[j]));
    return [ri, ...cells].join(",");
  });
  return [header, ...rows].join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function reconstructPath(
  nodes: string[],
  next: (string | null)[][],
  s: string,
  t: string
): string[] | null {
  const i = nodes.indexOf(s);
  const j = nodes.indexOf(t);
  if (i < 0 || j < 0) return null;
  if (!next?.[i]?.[j]) return null;

  const path: string[] = [s];
  let u = s;
  const guard = new Set<string>();
  while (u !== t) {
    if (guard.has(u)) return null;
    guard.add(u);
    const ui = nodes.indexOf(u);
    const hop = next[ui]?.[j] ?? null; // next-hop (nom)
    if (!hop) return null;
    path.push(hop);
    u = hop;
  }
  return path;
}

// petit dégradé bleu clair → bleu foncé
function heatColor(t: number) {
  const x = Math.max(0, Math.min(1, isFinite(t) ? t : 1));
  const start = { r: 227, g: 242, b: 253 }; // #e3f2fd
  const end = { r: 25, g: 118, b: 210 };   // #1976d2
  const r = Math.round(start.r + (end.r - start.r) * x);
  const g = Math.round(start.g + (end.g - start.g) * x);
  const b = Math.round(start.b + (end.b - start.b) * x);
  return `rgb(${r}, ${g}, ${b})`;
}

// ---------- Props & Handle (compat avec ta barre commune) ----------
type Props = {
  // facultatifs: pour pré-sélectionner un couple et afficher sa distance au-dessus
  start?: string;
  target?: string;
  onSummaryChange?: (summary: Record<string, any>) => void;
  onLog?: (msg: string) => void;
};

export type FloydHandle = {
  // aligné avec les autres *GraphAnimation* (ici play/pause/step n’animent pas, on rafraîchit seulement)
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
};

const FloydWarshallGraphAnimation = forwardRef<FloydHandle, Props>(
  ({ start, target, onSummaryChange, onLog }, ref) => {
    const [nodes, setNodes] = useState<string[]>([]);
    const [distances, setDistances] = useState<number[][]>([]);
    const [next, setNext] = useState<(string | null)[][]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [selectedPath, setSelectedPath] = useState<string[] | null>(null);

    // pour l’entête (optionnel)
    const cities = useMemo(() => [...graph.nodes].sort(), []);
    const [s, setS] = useState<string>(start ?? cities[0] ?? "");
    const [t, setT] = useState<string>(target ?? cities[1] ?? "");

    const flatFinite = useMemo(() => {
      const vals: number[] = [];
      distances.forEach(row =>
        row.forEach(v => {
          if (v != null && v < INF) vals.push(v);
        })
      );
      return vals;
    }, [distances]);

    const minVal = useMemo(() => (flatFinite.length ? Math.min(...flatFinite) : 0), [flatFinite]);
    const maxVal = useMemo(() => (flatFinite.length ? Math.max(...flatFinite) : 1), [flatFinite]);
    const normalize = (v: number | null | undefined) => {
      if (v == null || v >= INF) return 1;
      if (maxVal === minVal) return 0;
      return (v - minVal) / (maxVal - minVal);
    };

    const fetchMatrix = async () => {
      setLoading(true);
      setErr(null);
      setInfo(null);
      setSelectedPath(null);
      try {
        const raw = await computeFloydWarshallAsync(graph as any);
        const { nodes, distances, next } = normalizeFW(raw as any);
        if (!Array.isArray(nodes) || !Array.isArray(distances) || !Array.isArray(next)) {
          setErr("Réponse API inattendue : nodes/distances/next manquants.");
          setLoading(false);
          return;
        }
        setNodes(nodes);
        setDistances(distances);
        setNext(next);

        // push résumé optionnel
        if (s && t) {
          const i = nodes.indexOf(s);
          const j = nodes.indexOf(t);
          const d = i >= 0 && j >= 0 ? distances?.[i]?.[j] : null;
          const unreachable = d == null || d >= INF;
          onSummaryChange?.({
            algo: "Floyd–Warshall (matrice)",
            start: s,
            target: t,
            distance: unreachable ? null : Number(d),
          });
          onLog?.(
            unreachable
              ? `FW: ${s} → ${t} inatteignable`
              : `FW: ${s} → ${t} = ${Number(d)}`
          );
        }

        if (!distances.length) setInfo("La matrice est vide.");
      } catch (e: any) {
        setErr(e?.message ?? "Erreur lors de l’appel à /floyd-warshall.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchMatrix();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCellClick = (i: number, j: number) => {
      if (!nodes.length || !next.length) return;
      const s = nodes[i];
      const t = nodes[j];
      const path = reconstructPath(nodes, next, s, t);
      setSelectedPath(path);
      if (path && path.length >= 2) {
        onLog?.(`Chemin ${s} → ${t} : ${path.join(" → ")}`);
      } else {
        onLog?.(`Aucun chemin ${s} → ${t}`);
      }
    };

    const handleExportCSV = () => {
      if (!nodes.length || !distances.length) return;
      const csv = toCSV(nodes, distances);
      downloadText("floyd-warshall-distances.csv", csv);
    };

    const handleCopy = async () => {
      if (!nodes.length || !distances.length) return;
      const csv = toCSV(nodes, distances);
      try {
        await navigator.clipboard.writeText(csv);
        setInfo("Matrice copiée dans le presse-papiers (CSV).");
        setTimeout(() => setInfo(null), 2000);
      } catch {
        setErr("Impossible de copier dans le presse-papiers.");
        setTimeout(() => setErr(null), 2000);
      }
    };

    // --- expose des “contrôles” compatibles avec tes autres anims ---
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          // pas d’animation continue pour la matrice → on relance un refresh
          fetchMatrix();
        },
        pause: () => {
          // rien à pauser
        },
        reset: () => {
          setSelectedPath(null);
          setInfo(null);
          setErr(null);
          onLog?.("↺ Réinitialisation Floyd–Warshall (matrice)");
        },
        step: () => {
          // pas d’étape, on rafraîchit aussi
          fetchMatrix();
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [nodes, distances, next, s, t]
    );

    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* En-tête + actions */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
          <Typography variant="h6" sx={{ textAlign: { xs: "center", sm: "left" } }}>
            Floyd–Warshall — Matrice des plus courts chemins (toutes paires)
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Sélecteurs optionnels pour afficher une distance dans l’entête */}
            <TextField select size="small" label="Départ" value={s} onChange={(e) => setS(e.target.value)} sx={{ minWidth: 160 }}>
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Arrivée" value={t} onChange={(e) => setT(e.target.value)} sx={{ minWidth: 160 }}>
              {cities.filter((c) => c !== s).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <Tooltip title="Rafraîchir">
              <span>
                <IconButton onClick={fetchMatrix} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Copier (CSV)">
              <span>
                <IconButton onClick={handleCopy} disabled={!nodes.length}>
                  <ContentCopyIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button variant="outlined" startIcon={<FileDownloadIcon />} disabled={!nodes.length} onClick={handleExportCSV}>
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* Distance s→t courante si possible */}
        {nodes.length > 0 && (() => {
          const i = nodes.indexOf(s);
          const j = nodes.indexOf(t);
          const d = i >= 0 && j >= 0 ? distances?.[i]?.[j] : null;
          const unreachable = d == null || d >= INF;
          return (
            <Typography variant="body2" sx={{ mb: 1, color: "#334155" }}>
              Distance {s} → {t} : <b>{unreachable ? "∞" : Number(d)}</b>
            </Typography>
          );
        })()}

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}
        {info && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {info}
          </Alert>
        )}

        {/* Matrice */}
        <Paper elevation={3} sx={{ overflow: "auto", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Box component="table" sx={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 600 }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    background: "#fff",
                    zIndex: 3,
                    padding: "8px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    borderRight: "1px solid #e2e8f0",
                    textAlign: "left",
                  }}
                />
                {nodes.map((c, j) => (
                  <th
                    key={`col-${c}`}
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#fff",
                      zIndex: 2,
                      padding: "8px 12px",
                      borderBottom: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map((ri, i) => (
                <tr key={`row-${ri}`}>
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "#fff",
                      zIndex: 1,
                      padding: "8px 12px",
                      borderRight: "1px solid #e2e8f0",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    {ri}
                  </th>
                  {nodes.map((_, j) => {
                    const val = distances?.[i]?.[j] ?? null;
                    const isInf = val == null || val >= INF;
                    const tone = isInf ? 1 : normalize(val);
                    const bg = heatColor(tone);
                    const isDiag = i === j;

                    return (
                      <td
                        key={`cell-${i}-${j}`}
                        onClick={() => handleCellClick(i, j)}
                        title={
                          isInf
                            ? `${nodes[i]} → ${nodes[j]} : ∞ (inatteignable)`
                            : `${nodes[i]} → ${nodes[j]} : ${val}`
                        }
                        style={{
                          padding: "6px 10px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: isDiag ? "#f8fafc" : bg,
                          color: isInf ? "#334155" : (tone > 0.6 ? "#fff" : "#0f172a"),
                          borderBottom: "1px solid #e2e8f0",
                          borderRight: "1px solid #e2e8f0",
                          fontWeight: isDiag ? 600 : 400,
                          userSelect: "none",
                        }}
                      >
                        {isDiag ? "0" : fmt(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Box>
        </Paper>

        {/* Chemin sur clic */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Chemin (cliquer une cellule) :
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {selectedPath && selectedPath.length >= 2 ? (
              <Typography variant="body2">{selectedPath.join(" → ")}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun chemin sélectionné.
              </Typography>
            )}
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            Astuce : survoler une cellule pour voir la distance, cliquer pour reconstruire le chemin via la matrice “next”.
          </Typography>
        </Box>
      </Box>
    );
  }
);

export default FloydWarshallGraphAnimation;
