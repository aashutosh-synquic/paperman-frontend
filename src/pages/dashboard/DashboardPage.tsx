"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Package,
  Users,
  ShoppingCart,
  FileText,
  Layers,
  UserCheck,
} from "lucide-react";
import { getCategories } from "@/services/category";

import { getProducts } from "@/services/product";
import { getInventories } from "@/services/inventory";
import { fetchLeads } from "@/services/leads";
import { fetchCustomers } from "@/services/customers";
import { fetchUsers } from "@/services/users";

import type { Category } from "@/services/category";
import type { Product } from "@/services/product";
import type { Inventory } from "@/services/inventory";
import type { Lead } from "@/services/leads";
import type { CustomerView } from "@/services/customers";
import type { UserView } from "@/services/users";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  // Helper to get month label from date string
  function getMonthLabel(dateStr: string | undefined) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  }

  // Aggregate counts per month for each entity
  function getMonthlyCounts<T extends { createdAt?: string }>(items: T[]) {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const label = getMonthLabel(item.createdAt);
      if (!label) return;
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }

  // TanStack Query hooks for each resource
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const {
    data: products = [],
    isLoading: loadingProducts,
    error: errorProducts,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  const {
    data: inventory = [],
    isLoading: loadingInventory,
    error: errorInventory,
  } = useQuery<Inventory[]>({
    queryKey: ["inventory"],
    queryFn: getInventories,
  });
  const {
    data: enquiries = [],
    isLoading: loadingEnquiries,
    error: errorEnquiries,
  } = useQuery<Lead[]>({
    queryKey: ["enquiries"],
    queryFn: fetchLeads,
  });
  const {
    data: customers = [],
    isLoading: loadingCustomers,
    error: errorCustomers,
  } = useQuery<CustomerView[]>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
  const {
    data: users = [],
    isLoading: loadingUsers,
    error: errorUsers,
  } = useQuery<UserView[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const loading =
    loadingCategories ||
    loadingProducts ||
    loadingInventory ||
    loadingEnquiries ||
    loadingCustomers ||
    loadingUsers;
  const error =
    errorCategories ||
    errorProducts ||
    errorInventory ||
    errorEnquiries ||
    errorCustomers ||
    errorUsers;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-red-600">
          Error loading dashboard data.
        </div>
      </div>
    );
  }

  // Process data for charts

  const categoryData = categories.map((cat: Category) => ({
    name: cat.name,
    products: products.filter((p: Product) => p.category === cat.name).length,
  }));

  const enquiryStatusData = [
    {
      name: "Open",
      value: enquiries.filter((e: Lead) => e.status === "open").length,
      color: "#f59e0b",
    },
    {
      name: "Converted",
      value: enquiries.filter((e: Lead) => e.status === "converted").length,
      color: "#10b981",
    },
    {
      name: "Closed",
      value: enquiries.filter((e: Lead) => e.status === "closed").length,
      color: "#ef4444",
    },
  ];

  const inventoryStatusData = [
    {
      name: "Active",
      value: inventory.filter((i: Inventory) => i.status === "active").length,
      color: "#10b981",
    },
    {
      name: "Inactive",
      value: inventory.filter((i: Inventory) => i.status === "inactive").length,
      color: "#6b7280",
    },
  ];

  // Build area chart data for Enquiries, Customers, Products per month (real data)
  const monthLabelsSet = new Set<string>();
  const enquiriesByMonth = getMonthlyCounts(enquiries);
  const customersByMonth = getMonthlyCounts(customers);
  const productsByMonth = getMonthlyCounts(products);
  Object.keys(enquiriesByMonth).forEach((m) => monthLabelsSet.add(m));
  Object.keys(customersByMonth).forEach((m) => monthLabelsSet.add(m));
  Object.keys(productsByMonth).forEach((m) => monthLabelsSet.add(m));
  const monthLabels = Array.from(monthLabelsSet).sort((a, b) => {
    // Sort by year and month
    const [ma, ya] = a.split(" ");
    const [mb, yb] = b.split(" ");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dA = new Date(Number("20" + ya), months.indexOf(ma));
    const dB = new Date(Number("20" + yb), months.indexOf(mb));
    return dA.getTime() - dB.getTime();
  });
  const areaChartData = monthLabels.map((label) => ({
    name: label,
    enquiries: enquiriesByMonth[label] || 0,
    customers: customersByMonth[label] || 0,
    products: productsByMonth[label] || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t("Business Dashboard")}
          </h1>
          <p className="text-gray-600">
            {t("Complete overview of your business operations")}
          </p>
        </div>

        {/* Main Charts Section - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stacked Area Chart: Enquiries, Customers, Products Created Per Month */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Monthly Business Trends")}
              </CardTitle>
              <CardDescription>
                {t("Enquiries, Customers, and Products created per month")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={areaChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="enquiries"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                  />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                  />
                  <Area
                    type="monotone"
                    dataKey="products"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Products by Category Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Products by Category")}
              </CardTitle>
              <CardDescription>
                {t("Distribution of products across different categories")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="products"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Enquiry Status Distribution")}
              </CardTitle>
              <CardDescription>
                {t("Current status of all enquiries")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={enquiryStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {enquiryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Inventory Status")}
              </CardTitle>
              <CardDescription>
                {t("Active vs inactive inventory items")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={inventoryStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Conversion Metrics")}
              </CardTitle>
              <CardDescription>
                {t("Enquiry to customer conversion tracking")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {t("Total Enquiries")}
                  </p>
                  <p className="text-3xl font-bold text-amber-600">
                    {enquiries.length}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600">{t("Converted")}</p>
                  <p className="text-3xl font-bold text-green-600">
                    {customers.length}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {t("Conversion Rate")}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {enquiries.length > 0
                      ? Math.round((customers.length / enquiries.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Recent Products")}
              </CardTitle>
              <CardDescription>
                {t("Latest products added to catalog")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.category} • {product.type}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {product.gsm} GSM
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {t("Recent Enquiries")}
              </CardTitle>
              <CardDescription>
                {t("Latest customer enquiries and their status")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enquiries.slice(0, 6).map((enquiry) => (
                  <div
                    key={enquiry._id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {enquiry.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {enquiry.company || "No company"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        enquiry.status === "open"
                          ? "default"
                          : enquiry.status === "converted"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        enquiry.status === "open"
                          ? "bg-amber-100 text-amber-800"
                          : enquiry.status === "converted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {enquiry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Cards - Now at Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Layers className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("Inventory Items")}
              </CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enquiries.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <UserCheck className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
