import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//
import { AuthProvider } from "./providers/AuthProvider";
//
import ProtectedRoute from "./components/ProtectedRoute";
//
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import PublicPage from "./pages/PublicPage";
import LogoutPage from "./pages/LogoutPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <PublicPage />,
  },
  {
    path: "/login",
    Component: () => <LoginPage />,
  },
  {
    path: "/logout",
    Component: () => <LogoutPage />,
  },
  {
    path: "/dashboard",
    Component: () => (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
