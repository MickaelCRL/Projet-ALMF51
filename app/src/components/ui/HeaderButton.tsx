import { Button } from "@mui/material";
import type { ReactNode } from "react";

interface HeaderButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

function HeaderButton({ children, onClick }: HeaderButtonProps) {
  return (
    <Button
      onClick={onClick}
      sx={{
        color: "#64748b",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 500,
        textTransform: "none",
        fontSize: "15px",
        "&:hover": {
          color: "#6366f1",
          backgroundColor: "#f1f5f9",
        },
      }}
    >
      {children}
    </Button>
  );
}

export default HeaderButton;
