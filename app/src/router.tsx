import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Traversal from "./pages/Traversal";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";
import CoveringTree from "./pages/CoveringTree";
import ShortestPath from "./pages/ShortestPath";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/parcours",
        element: <Traversal />,
      },
      {
        path: "/arbre-couvrant",
        element: <CoveringTree />,
      },
      {
        path: "/chemin-optimal",
        element : <ShortestPath />
      }
    ],
  },
]);

export default router;
