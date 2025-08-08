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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { sendQuoteRequest, sendEnquiry } from "@/services/sendMail";

export default function StockPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedInventories, setSelectedInventories] = useState<any[]>([]);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<string | null>(null);
  const [enquiryDialogOpen, setEnquiryDialogOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    message: "",
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);

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

  // Flatten all inventories for selection
  const allInventories = useMemo(
    () =>
      allProducts.flatMap((prod) =>
        (prod.inventory || []).map((inv: any) => ({
          ...inv,
          product: prod,
          _invId: inv._id,
        }))
      ),
    [allProducts]
  );

  // Inventory selection handlers
  const isInventorySelected = (invId: string) =>
    selectedInventories.some((inv) => inv._invId === invId);

  const handleInventorySelect = (inv: any, checked: boolean) => {
    setSelectedInventories((prev) =>
      checked ? [...prev, inv] : prev.filter((i) => i._invId !== inv._invId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInventories(allInventories);
    } else {
      setSelectedInventories([]);
    }
  };

  // Quote form submit
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    setQuoteSuccess(null);
    if (
      !quoteForm.name.trim() ||
      !quoteForm.phone.trim() ||
      !quoteForm.email.trim() ||
      !quoteForm.company.trim() ||
      selectedInventories.length === 0
    ) {
      setQuoteError("Please fill all fields and select at least one item.");
      return;
    }
    setQuoteSubmitting(true);
    try {
      await sendQuoteRequest({
        ...quoteForm,
        items: selectedInventories,
      });
      setQuoteSuccess(
        "Quote request submitted! Our team will contact you soon."
      );
      setQuoteForm({ name: "", phone: "", email: "", company: "" });
      setSelectedInventories([]);
      setQuoteDialogOpen(false);
    } catch (err: any) {
      setQuoteError("Failed to send quote request. Please try again.");
    }
    setQuoteSubmitting(false);
  };

  // Enquiry form submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);
    setEnquirySuccess(null);
    if (
      !enquiryForm.name.trim() ||
      !enquiryForm.phone.trim() ||
      !enquiryForm.email.trim() ||
      !enquiryForm.company.trim() ||
      !enquiryForm.message.trim()
    ) {
      setEnquiryError("Please fill all fields.");
      return;
    }
    setEnquirySubmitting(true);
    try {
      await sendEnquiry(enquiryForm);
      setEnquirySuccess("Enquiry submitted! Our team will contact you soon.");
      setEnquiryForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        message: "",
      });
      setEnquiryDialogOpen(false);
    } catch (err: any) {
      setEnquiryError("Failed to send enquiry. Please try again.");
    }
    setEnquirySubmitting(false);
  };

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
                <span>Available Inventory ({allInventories.length} items)</span>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Updated: Today
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <Checkbox
                  checked={
                    selectedInventories.length === allInventories.length &&
                    allInventories.length > 0
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select All
                </Label>
                <Button
                  size="sm"
                  className="ml-auto"
                  disabled={selectedInventories.length === 0}
                  onClick={() => setQuoteDialogOpen(true)}
                >
                  Request Quote ({selectedInventories.length})
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th></th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Product
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        GSM
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Length
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Width
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Unit
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Weight (kg)
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Quantity
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInventories.map((inv) => (
                      <tr
                        key={inv._invId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-2">
                          <Checkbox
                            checked={isInventorySelected(inv._invId)}
                            onCheckedChange={(checked) =>
                              handleInventorySelect(inv, !!checked)
                            }
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {inv.product.name}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs">
                            {inv.product.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {inv.product.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">{inv.product.gsm}</td>
                        <td className="py-4 px-4">{inv.item_length}</td>
                        <td className="py-4 px-4">{inv.item_width}</td>
                        <td className="py-4 px-4">{inv.item_lw_unit}</td>
                        <td className="py-4 px-4">{inv.weight}</td>
                        <td className="py-4 px-4">{inv.quantity}</td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              inv.status === "active" ? "default" : "secondary"
                            }
                            className={
                              inv.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allInventories.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No inventory found
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

      {/* Request Quote Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={quoteForm.phone}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={quoteForm.company}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, company: e.target.value }))
                  }
                  required
                  autoComplete="organization"
                />
              </div>
            </div>
            <div>
              <Label>Selected Items</Label>
              <ul className="list-disc ml-6 text-sm max-h-32 overflow-y-auto">
                {selectedInventories.map((inv) => (
                  <li key={inv._invId}>
                    {inv.product.name} ({inv.product.type},{" "}
                    {inv.product.category}) - {inv.weight}kg, Qty:{" "}
                    {inv.quantity}
                  </li>
                ))}
              </ul>
            </div>
            {quoteError && (
              <div className="text-red-500 text-sm">{quoteError}</div>
            )}
            {quoteSuccess && (
              <div className="text-green-600 text-sm">{quoteSuccess}</div>
            )}
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={quoteSubmitting}
                className="w-full"
              >
                {quoteSubmitting ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* General Enquiry Dialog */}
      <Dialog open={enquiryDialogOpen} onOpenChange={setEnquiryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>General Enquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={enquiryForm.name}
                  onChange={(e) =>
                    setEnquiryForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={enquiryForm.phone}
                  onChange={(e) =>
                    setEnquiryForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={enquiryForm.email}
                  onChange={(e) =>
                    setEnquiryForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={enquiryForm.company}
                  onChange={(e) =>
                    setEnquiryForm((f) => ({ ...f, company: e.target.value }))
                  }
                  required
                  autoComplete="organization"
                />
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Input
                as="textarea"
                value={enquiryForm.message}
                onChange={(e) =>
                  setEnquiryForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Type your enquiry here..."
                required
                className="min-h-[80px]"
              />
            </div>
            {enquiryError && (
              <div className="text-red-500 text-sm">{enquiryError}</div>
            )}
            {enquirySuccess && (
              <div className="text-green-600 text-sm">{enquirySuccess}</div>
            )}
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={enquirySubmitting}
                className="w-full"
              >
                {enquirySubmitting ? "Submitting..." : "Submit Enquiry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
