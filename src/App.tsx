import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//
import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import "./lib/i18n";
//
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundComponent from "./components/NotFound";
//
// import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import LogoutPage from "./pages/auth/LogoutPage";
//
import DashboardPage from "./pages/DashboardPage";
import CategoryPage from "./pages/CategoryPage";
import ProductsPage from "./pages/ProductPage";
import InventoryPage from "./pages/InventoryPage";
// import CustomersPage from "./pages/CustomerPage";
import DashboardLayout from "./components/DashboardLayout";

// redirects to /dashboard if authenticated, else /login
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootRedirect,
  },
  // 404 not found
  {
    path: "*",
    Component: () => <NotFoundComponent />,
  },
  // Auth routes
  {
    path: "/login",
    Component: () => <LoginPage />,
  },
  // {
  //   path: "/register",
  //   Component: () => <RegisterPage />,
  // },
  {
    path: "/logout",
    Component: () => <LogoutPage />,
  },
  // Protected route with outlet for dashboard sidebar and layout
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/categories",
        element: <CategoryPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      // {
      //   path: "/customers",
      //   element: <CustomersPage />,
      // },
    ],
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
