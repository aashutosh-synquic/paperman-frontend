import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import ReactDOM from "react-dom/client";
import './index.css'
import App from "./App.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />
);
