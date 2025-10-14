import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button } from "@mui/material";

const Header: React.FC = () => {
  return (
    <AppBar
      position="static"
      color="primary"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#000000",
        width: "100%",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Projet ALMF51
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit">Parcours</Button>
          <Button color="inherit">Arbre couvrant</Button>
          <Button color="inherit">Chemin optimal</Button>
          <Button color="inherit">À propos</Button>
        </Box>

        {/* Menu (mobile / futur) */}
        <IconButton
          color="inherit"
          edge="end"
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
