import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./components/Layout";
import APropos from "./pages/APropos";

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
        path: "/a-propos",
        element : <APropos/>
      }
    ],
  },
]);

export default router;
