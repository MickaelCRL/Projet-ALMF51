import Header from "./components/Header";
import { Container, Box, Typography } from "@mui/material";

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bienvenue dans le projet ALMF51
          </Typography>
          <Typography variant="body1">
            Expérimentez les algorithmes de graphes : BFS, DFS, Kruskal, Prim,
            Dijkstra, Bellman-Ford et Floyd-Warshall.
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default App;
