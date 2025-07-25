import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
  },
]);

const root = document.getElementById("root");

const queryClient = new QueryClient();

ReactDOM.createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
