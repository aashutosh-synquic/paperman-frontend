"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { apiUrl } from "@/services/index";

export default function StockPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Fetch data from API
  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/stock`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Flatten all products for stats and search/filter
  const allProducts = useMemo(
    () =>
      categories.flatMap((cat) =>
        (cat.products || []).map((prod) => ({
          ...prod,
          categoryName: cat.name,
        }))
      ),
    [categories]
  );

  // For filter buttons
  const categoryNames = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  );

  // Filtered products for table
  const filteredProducts = useMemo(() => {
    return allProducts.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.categoryName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  // Stats
  const totalProducts = allProducts.length;
  const inStockProducts = allProducts.filter((item) =>
    (item.inventory || []).some(
      (inv) => inv.status === "active" && inv.quantity > 0
    )
  ).length;
  const lowStockProducts = allProducts.filter((item) =>
    (item.inventory || []).some(
      (inv) => inv.status === "active" && inv.quantity > 0 && inv.quantity < 50
    )
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Available Stock
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our current inventory of paper reels by category and
              product. All items are available for immediate shipping with
              quality guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProducts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {inStockProducts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lowStockProducts}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Filter by:</span>
                  <div className="flex gap-2">
                    {categoryNames.map((category) => (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={
                          selectedCategory === category
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inventory Table */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Product Inventory ({filteredProducts.length} items)</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Updated: Today
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Product Name
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        GSM
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Unit
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Quantity
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Price
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item) => {
                      // Calculate total quantity and status from inventory
                      const totalQty = (item.inventory || []).reduce(
                        (sum, inv) =>
                          inv.status === "active" ? sum + inv.quantity : sum,
                        0
                      );
                      const status =
                        totalQty === 0
                          ? "Out of Stock"
                          : totalQty < 50
                          ? "Low Stock"
                          : "In Stock";
                      return (
                        <tr
                          key={item._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.type}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="text-xs">
                              {item.categoryName}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            {item.gsm}
                          </td>
                          <td className="py-4 px-4 text-gray-900">
                            {item.unit}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`font-medium ${
                                totalQty < 50
                                  ? "text-orange-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {totalQty}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900 font-medium">
                            ₹{item.price}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                status === "In Stock"
                                  ? "default"
                                  : status === "Low Stock"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                status === "In Stock"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : status === "Low Stock"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProduct(item)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProduct.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Product Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="outline">
                        {selectedProduct.categoryName}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GSM:</span>
                      <span className="font-medium">{selectedProduct.gsm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {selectedProduct.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">
                        {selectedProduct.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Availability & Pricing
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        variant={(() => {
                          const totalQty = (
                            selectedProduct.inventory || []
                          ).reduce(
                            (sum, inv) =>
                              inv.status === "active"
                                ? sum + inv.quantity
                                : sum,
                            0
                          );
                          if (totalQty === 0) return "secondary";
                          if (totalQty < 50) return "destructive";
                          return "default";
                        })()}
                        className={(() => {
                          const totalQty = (
                            selectedProduct.inventory || []
                          ).reduce(
                            (sum, inv) =>
                              inv.status === "active"
                                ? sum + inv.quantity
                                : sum,
                            0
                          );
                          if (totalQty === 0)
                            return "bg-gray-100 text-gray-600";
                          if (totalQty < 50)
                            return "bg-orange-100 text-orange-800";
                          return "bg-green-100 text-green-800";
                        })()}
                      >
                        {(() => {
                          const totalQty = (
                            selectedProduct.inventory || []
                          ).reduce(
                            (sum, inv) =>
                              inv.status === "active"
                                ? sum + inv.quantity
                                : sum,
                            0
                          );
                          if (totalQty === 0) return "Out of Stock";
                          if (totalQty < 50) return "Low Stock";
                          return "In Stock";
                        })()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity Available:</span>
                      <span className="font-medium">
                        {(selectedProduct.inventory || []).reduce(
                          (sum, inv) =>
                            inv.status === "active" ? sum + inv.quantity : sum,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Unit:</span>
                      <span className="font-bold text-green-600">
                        ₹{selectedProduct.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Product Description
                </h4>
                <p className="text-gray-600">
                  {selectedProduct.description ||
                    "This high-quality paper reel is manufactured using our sustainable processes and meets all industry standards. Perfect for various printing and packaging applications with consistent quality and reliable performance."}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Request Quote
                </Button>
                <Button variant="outline" className="flex-1">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
