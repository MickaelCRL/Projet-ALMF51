import MenuIcon from "@mui/icons-material/Menu";
import { Box } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import HeaderButton from "./ui/HeaderButton";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Parcours", path: "/parcours" },
    { label: "Arbre couvrant", path: "/arbre-couvrant" },
    { label: "Chemin optimal", path: "/chemin-optimal" },
    { label: "À propos", path: "/a-propos" },
  ];

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
        <Link to="/" style={{ textDecoration: "none" }}>
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
        </Link>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {navItems.map((item) => (
            <HeaderButton key={item.label} onClick={() => navigate(item.path)}>
              {item.label}
            </HeaderButton>
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
