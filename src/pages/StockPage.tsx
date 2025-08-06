"use client";

import { useState, useMemo } from "react";
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

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    name: "Standard White Paper Reel",
    category: "Standard",
    gsm: 80,
    unit: "Roll",
    quantity: 150,
    price: 45.99,
    status: "In Stock",
    width: "1200mm",
    length: "500m",
  },
  {
    id: 2,
    name: "Premium Coated Paper Reel",
    category: "Premium",
    gsm: 120,
    unit: "Roll",
    quantity: 75,
    price: 89.99,
    status: "In Stock",
    width: "1000mm",
    length: "400m",
  },
  {
    id: 3,
    name: "Eco-Friendly Recycled Reel",
    category: "Eco-Friendly",
    gsm: 90,
    unit: "Roll",
    quantity: 200,
    price: 52.99,
    status: "In Stock",
    width: "1200mm",
    length: "600m",
  },
  {
    id: 4,
    name: "Heavy Duty Industrial Reel",
    category: "Industrial",
    gsm: 250,
    unit: "Roll",
    quantity: 25,
    price: 125.99,
    status: "Low Stock",
    width: "1500mm",
    length: "300m",
  },
  {
    id: 5,
    name: "Lightweight Newsprint Reel",
    category: "Standard",
    gsm: 45,
    unit: "Roll",
    quantity: 300,
    price: 28.99,
    status: "In Stock",
    width: "1600mm",
    length: "800m",
  },
  {
    id: 6,
    name: "High-Gloss Magazine Paper",
    category: "Premium",
    gsm: 150,
    unit: "Roll",
    quantity: 50,
    price: 110.99,
    status: "In Stock",
    width: "900mm",
    length: "350m",
  },
  {
    id: 7,
    name: "Kraft Brown Paper Reel",
    category: "Specialty",
    gsm: 70,
    unit: "Roll",
    quantity: 120,
    price: 38.99,
    status: "In Stock",
    width: "1300mm",
    length: "700m",
  },
  {
    id: 8,
    name: "Food Grade Paper Reel",
    category: "Specialty",
    gsm: 60,
    unit: "Roll",
    quantity: 10,
    price: 95.99,
    status: "Low Stock",
    width: "1100mm",
    length: "450m",
  },
];

const categories = [
  "All",
  "Standard",
  "Premium",
  "Eco-Friendly",
  "Industrial",
  "Specialty",
];

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof inventoryData)[0] | null
  >(null);

  const filteredInventory = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const totalProducts = inventoryData.length;
  const inStockProducts = inventoryData.filter(
    (item) => item.status === "In Stock"
  ).length;
  const lowStockProducts = inventoryData.filter(
    (item) => item.status === "Low Stock"
  ).length;

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
                    {categories.map((category) => (
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
                <span>
                  Product Inventory ({filteredInventory.length} items)
                </span>
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
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.width} × {item.length}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{item.gsm}</td>
                        <td className="py-4 px-4 text-gray-900">{item.unit}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-medium ${
                              item.quantity < 50
                                ? "text-orange-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          ${item.price}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              item.status === "In Stock"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              item.status === "In Stock"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {item.status}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredInventory.length === 0 && (
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
                        {selectedProduct.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GSM:</span>
                      <span className="font-medium">{selectedProduct.gsm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Width:</span>
                      <span className="font-medium">
                        {selectedProduct.width}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Length:</span>
                      <span className="font-medium">
                        {selectedProduct.length}
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
                        variant={
                          selectedProduct.status === "In Stock"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          selectedProduct.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {selectedProduct.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity Available:</span>
                      <span className="font-medium">
                        {selectedProduct.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per Unit:</span>
                      <span className="font-bold text-green-600">
                        ${selectedProduct.price}
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
                  This high-quality paper reel is manufactured using our
                  sustainable processes and meets all industry standards.
                  Perfect for various printing and packaging applications with
                  consistent quality and reliable performance.
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
