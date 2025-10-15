import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Parcours from "./pages/Parcours";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";

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
        element: <Parcours />,
      },
    ],
  },
]);

export default router;
