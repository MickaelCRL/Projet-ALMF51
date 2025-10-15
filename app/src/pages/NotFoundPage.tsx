import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            py: 8,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: "120px",
              fontWeight: 700,
              color: "#6366f1",
              fontFamily: "Inter, system-ui, sans-serif",
              mb: 2,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              fontFamily: "Inter, system-ui, sans-serif",
              mb: 2,
            }}
          >
            Page introuvable
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              fontSize: "18px",
              fontFamily: "Inter, system-ui, sans-serif",
              mb: 4,
            }}
          >
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </Typography>

          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{
              backgroundColor: "#6366f1",
              color: "#ffffff",
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "16px",
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default NotFoundPage;
