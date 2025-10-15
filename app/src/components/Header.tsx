import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/material";
import HeaderButton from "./ui/HeaderButton";

function Header() {
  const navItems = ["Parcours", "Arbre couvrant", "Chemin optimal", "À propos"];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#0f172a",
        width: "100%",
        borderBottom: "2px solid #e2e8f0",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "20px",
            color: "#0f172a",
          }}
        >
          Projet ALMF51
        </Typography>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {navItems.map((item) => (
            <HeaderButton key={item}>{item}</HeaderButton>
          ))}
        </Box>

        <IconButton
          sx={{
            display: { xs: "flex", md: "none" },
            color: "#64748b",
          }}
          edge="end"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
