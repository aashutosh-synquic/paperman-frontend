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
  Package,
  TrendingUp,
  AlertCircle,
  Download,
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

import { sendQuoteRequest, createEnquiryLead } from "@/services/sendMail";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Lightweight type to represent selected inventory rows in the quote table
// without over-constraining the existing data model
type SelectedInventory = {
  _invId: string;
  product: {
    name: string;
    category: string;
    type: string;
    gsm: number | string;
  };
  item_length?: number | string;
  item_width?: number | string;
  item_lw_unit?: string;
  weight: number;
  quantity: number;
  status?: string;
};

export default function StockPage() {
  // Define Category and Product types for better type safety
  type InventoryFromApi = {
    _id: string;
    item_length?: number | string;
    item_width?: number | string;
    item_lw_unit?: string;
    weight: number;
    quantity: number;
    status?: string;
  };

  type Product = {
    name: string;
    category: string;
    type: string;
    gsm: number | string;
    inventory?: InventoryFromApi[];
  };

  type Category = {
    name: string;
    products?: Product[];
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInventories, setSelectedInventories] = useState<
    SelectedInventory[]
  >([]);
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
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
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

  // Auto-hide global success after a few seconds
  useEffect(() => {
    if (!globalSuccess) return;
    const t = setTimeout(() => setGlobalSuccess(null), 5000);
    return () => clearTimeout(t);
  }, [globalSuccess]);

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
        (prod.inventory || []).map(
          (inv) =>
            ({
              ...inv,
              product: prod,
              _invId: inv._id,
            } as SelectedInventory)
        )
      ),
    [allProducts]
  );

  // Inventory selection handlers
  const isInventorySelected = (invId: string) =>
    selectedInventories.some((inv) => inv._invId === invId);

  const handleInventorySelect = (inv: SelectedInventory, checked: boolean) => {
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

  // Export as Excel handler
  const handleExportExcel = () => {
    if (!allInventories.length) {
      toast.error("No inventory to export.");
      return;
    }
    // Prepare data for Excel
    const data = allInventories.map((inv) => ({
      "Product Name": inv.product.name,
      Category: inv.product.category,
      Type: inv.product.type,
      GSM: inv.product.gsm,
      Length: inv.item_length,
      Width: inv.item_width,
      Unit: inv.item_lw_unit,
      "Weight (kg)": inv.weight,
      Quantity: inv.quantity,
      Status: inv.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_export.xlsx");
    toast.success("Inventory exported as Excel file.");
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
      toast.error("Please fill all fields and select at least one item.");
      setQuoteError("Please fill all fields and select at least one item.");
      return;
    }
    setQuoteSubmitting(true);
    try {
      await sendQuoteRequest({
        ...quoteForm,
        items: selectedInventories,
      });
      const msg = "Quote request submitted! Our team will contact you soon.";
      toast.success(msg);
      setQuoteSuccess(msg);
      setGlobalSuccess(msg);
      setQuoteForm({ name: "", phone: "", email: "", company: "" });
      setSelectedInventories([]);
      setQuoteDialogOpen(false);
    } catch {
      toast.error("Failed to send quote request. Please try again.");
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
      toast.error("Please fill all fields.");
      setEnquiryError("Please fill all fields.");
      return;
    }
    setEnquirySubmitting(true);
    try {
      // Use the backend API to create a lead (enquiry)
      await createEnquiryLead(enquiryForm);
      toast.success("Enquiry submitted! Our team will contact you soon.");
      setEnquirySuccess("Enquiry submitted! Our team will contact you soon.");
      setEnquiryForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        message: "",
      });
      setEnquiryDialogOpen(false);
    } catch {
      toast.error("Failed to send enquiry. Please try again.");
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

      {/* Success banner after quote submission */}
      {globalSuccess && !quoteDialogOpen && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-md bg-green-50 border border-green-200 p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm">
                ✓
              </span>
              <div>
                <p className="text-green-800 font-medium">{globalSuccess}</p>
                <p className="text-sm text-green-700">
                  We'll reach out shortly with your quote.
                </p>
              </div>
            </div>
            <button
              onClick={() => setGlobalSuccess(null)}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
              aria-label="Dismiss success"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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

      {/* Filters and Search (search only) */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inventory Table - Responsive */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
              <div className="mb-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end ml-auto">
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    onClick={handleExportExcel}
                  >
                    <Download className="w-4 h-4 text-white" />
                    Export as Excel
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedInventories.length === 0}
                    onClick={() => setQuoteDialogOpen(true)}
                  >
                    Request Quote ({selectedInventories.length})
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th></th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Product
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Category
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        GSM
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Length
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Width
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Unit
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Weight (kg)
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">
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
                        <td className="py-3 px-2">
                          <Checkbox
                            checked={isInventorySelected(inv._invId)}
                            onCheckedChange={(checked) =>
                              handleInventorySelect(inv, !!checked)
                            }
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-gray-900">
                            {inv.product.name}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">
                            {inv.product.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs">
                            {inv.product.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{inv.product.gsm}</td>
                        <td className="py-3 px-2">{inv.item_length}</td>
                        <td className="py-3 px-2">{inv.item_width}</td>
                        <td className="py-3 px-2">{inv.item_lw_unit}</td>
                        <td className="py-3 px-2">{inv.weight}</td>
                        <td className="py-3 px-2">{inv.quantity}</td>
                        <td className="py-3 px-2">
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

      {/* Request Quote Dialog - Responsive Table */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-2xl p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle>Request Quote</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
            {/* Helper text */}
            <p className="text-sm text-gray-600 -mt-2">
              Please share your contact details and review your selected items
              below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Name</Label>
                <Input
                  value={quoteForm.name}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g., Priya Sharma"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <Label className="mb-2 block">Phone Number</Label>
                <Input
                  type="tel"
                  value={quoteForm.phone}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="e.g., +91 98765 43210"
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label className="mb-2 block">Email</Label>
                <Input
                  type="email"
                  value={quoteForm.email}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="e.g., priya@company.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label className="mb-2 block">Company Name</Label>
                <Input
                  value={quoteForm.company}
                  onChange={(e) =>
                    setQuoteForm((f) => ({ ...f, company: e.target.value }))
                  }
                  placeholder="e.g., GreenLeaf Papers Pvt. Ltd."
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Selected items table - scrollable and responsive */}
            <div>
              <Label className="mb-2 block">Selected Items</Label>
              {selectedInventories.length > 0 ? (
                <div className="mt-2 border border-gray-200 rounded-md overflow-x-auto w-full">
                  <div className="min-w-[500px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            Product
                          </th>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            GSM
                          </th>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            Type
                          </th>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            Category
                          </th>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            Weight (kg)
                          </th>
                          <th className="text-left px-3 py-2 font-medium text-gray-700">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInventories.map((inv) => (
                          <tr
                            key={inv._invId}
                            className="border-t border-gray-100"
                          >
                            <td className="px-3 py-2 text-gray-900">
                              {inv.product.name}
                            </td>
                            <td className="px-3 py-2">{inv.product.gsm}</td>
                            <td className="px-3 py-2 capitalize">
                              {inv.product.type}
                            </td>
                            <td className="px-3 py-2">
                              {inv.product.category}
                            </td>
                            <td className="px-3 py-2">{inv.weight}</td>
                            <td className="px-3 py-2">{inv.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  No items selected. Go back and choose inventory items to
                  quote.
                </p>
              )}
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
                <Label className="mb-2 block">Name</Label>
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
                <Label className="mb-2 block">Phone Number</Label>
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
                <Label className="mb-2 block">Email</Label>
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
                <Label className="mb-2 block">Company Name</Label>
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
              <Label className="mb-2 block">Message</Label>
              <textarea
                value={enquiryForm.message}
                onChange={(e) =>
                  setEnquiryForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Type your enquiry here..."
                required
                className="min-h-[100px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
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
