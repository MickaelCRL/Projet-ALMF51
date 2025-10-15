import { Box } from "@mui/material";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Outlet />
    </Box>
  );
}
