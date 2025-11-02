import { useRef, useState } from "react";
import { Button, Stack, Typography, Alert } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import type { Graph } from "../../models/Graph";
import { validateAndNormalizeGraph } from "../../utils/validateGraph";

type Props = {
  onGraphLoaded: (g: Graph) => void;
};

export default function GraphUploader({ onGraphLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = validateAndNormalizeGraph(json);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError(null);
      setFileName(file.name);
      onGraphLoaded(res.graph);
    } catch (e: any) {
      setError("Impossible de lire ce fichier JSON.");
    }
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          // reset pour pouvoir re-sélectionner le même fichier
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button variant="outlined" startIcon={<UploadIcon />} onClick={handlePick}>
        Importer un graphe (.json)
      </Button>
      {fileName && (
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {fileName}
        </Typography>
      )}
      {error && <Alert severity="warning">{error}</Alert>}
    </Stack>
  );
}
