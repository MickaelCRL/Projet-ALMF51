import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <App />,
      }
    ],
  },
]);

export default router;
