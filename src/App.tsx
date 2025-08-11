import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//
import { AuthProvider } from "./providers/AuthProvider";
import "./lib/i18n";
import { Toaster } from "@/components/ui/sonner";
//
import ProtectedRoute from "./components/ProtectedRoute";
import NotFoundComponent from "./components/NotFound";
//
// import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import LogoutPage from "./pages/auth/LogoutPage";
//
import DashboardPage from "./pages/dashboard/DashboardPage";
import CategoryPage from "./pages/dashboard/CategoryPage";
import ProductsPage from "./pages/dashboard/ProductPage";
import InventoryPage from "./pages/dashboard/InventoryPage";
import CustomersPage from "./pages/dashboard/CustomerPage";
import LeadsPage from "./pages/dashboard/LeadsPage";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import StockPage from "./pages/StockPage";
import UsersPage from "./pages/dashboard/UsersPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <LandingPage />,
  },
  {
    path: "/stock",
    Component: () => <StockPage />,
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
      {
        path: "/customers",
        element: <CustomersPage />,
      },
      {
        path: "/enquiries",
        element: <LeadsPage />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
