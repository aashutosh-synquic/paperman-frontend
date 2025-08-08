"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inventory,
  getInventories,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../services/inventory";
import { getProducts, Product } from "../services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import ParseDate from "@/utils/parseDate.ts";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

function InventoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [deletingItem, setDeletingItem] = useState<Inventory | null>(null);

  // Form state for inventory creation
  const [form, setForm] = useState<{
    productId: string;
    item_length: string;
    item_width: string;
    item_lw_unit: "cm" | "inch";
    weight: string;
    remarks: string;
    status: "active" | "inactive";
  }>({
    productId: "",
    item_length: "",
    item_width: "",
    item_lw_unit: "cm",
    weight: "",
    remarks: "",
    status: "active",
  });

  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const {
    data: inventories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: getInventories,
  });

  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventories"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateInventory(payload._id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (_id: string) => deleteInventory(_id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventories"] }),
  });

  // Helper to get selected product
  const selectedProduct = products.find(
    (p: Product) => p._id === form.productId
  );

  // Validation
  const validateForm = () => {
    const newErrors: any = {};
    if (!form.productId) newErrors.productId = "Product is required";
    if (
      !form.item_length ||
      isNaN(Number(form.item_length)) ||
      Number(form.item_length) <= 0
    )
      newErrors.item_length = "Length is required";
    if (
      !form.item_width ||
      isNaN(Number(form.item_width)) ||
      Number(form.item_width) <= 0
    )
      newErrors.item_width = "Width is required";
    if (
      !form.item_lw_unit ||
      (form.item_lw_unit !== "cm" && form.item_lw_unit !== "inch")
    )
      newErrors.item_lw_unit = "Unit is required";
    if (selectedProduct?.type === "reel") {
      if (
        !form.weight ||
        isNaN(Number(form.weight)) ||
        Number(form.weight) <= 0
      )
        newErrors.weight = "Weight (kg) is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate bundle weight if needed
  const calcBundleWeight = () => {
    if (!selectedProduct || selectedProduct.type !== "bundle") return "";
    const L = Number(form.item_length);
    const W = Number(form.item_width);
    const gsm = Number(selectedProduct.gsm);
    if (!L || !W || !gsm) return "";
    let weight = 0;
    if (form.item_lw_unit === "inch") {
      weight = ((L * W * gsm) / 1550) * 144;
    } else {
      weight = ((L * W * gsm) / 10000) * 144;
    }
    return weight ? weight.toFixed(2) : "";
  };

  const isFormValid =
    form.productId &&
    form.item_length &&
    form.item_width &&
    form.item_lw_unit &&
    form.status &&
    !isNaN(Number(form.item_length)) &&
    !isNaN(Number(form.item_width)) &&
    Object.keys(errors).length === 0;

  // Handle form submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    let payload: any = {
      productId: form.productId,
      item_length: Number(form.item_length),
      item_width: Number(form.item_width),
      item_lw_unit: form.item_lw_unit,
      remarks: form.remarks,
      status: "active",
      date: todayStr,
    };

    if (selectedProduct?.type === "reel") {
      payload.weight = Number(form.weight);
      payload.quantity = Number(form.weight); // for compatibility
    } else if (selectedProduct?.type === "bundle") {
      const bundleWeight = Number(calcBundleWeight());
      payload.weight = bundleWeight;
      payload.quantity = bundleWeight; // for compatibility
    }

    if (editingItem) {
      await updateMutation.mutateAsync({ ...editingItem, ...payload });
      setEditingItem(null);
    } else {
      await createMutation.mutateAsync(payload as Inventory);
    }
    setForm({
      productId: "",
      item_length: "",
      item_width: "",
      item_lw_unit: "cm",
      weight: "",
      remarks: "",
      status: "active",
    });
    setProductSearch("");
    setIsDialogOpen(false);
    setSubmitting(false);
    setErrors({});
  };

  const handleEdit = (inv: Inventory) => {
    setEditingItem(inv);
    setForm({
      productId: inv.productId,
      item_length: inv.item_length,
      item_width: inv.item_width,
      item_lw_unit: inv.item_lw_unit,
      remarks: inv.remarks,
      status: inv.status,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    await deleteMutation.mutateAsync(deletingItem._id!);
    setIsDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns: ColumnDef<Inventory>[] = [
    {
      accessorKey: "productId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Product")}
        </Button>
      ),
      cell: ({ row }) => {
        const prod = products.find(
          (p: Product) => p._id === row.original.productId
        );
        return prod ? (
          <span>
            {prod.name}
            {prod.category && (
              <Badge className="ml-2" variant="outline">
                {prod.category}
              </Badge>
            )}
          </span>
        ) : (
          row.original.productId
        );
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Quantity")}
        </Button>
      ),
      cell: ({ row }) => row.original.quantity,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Created At")}
        </Button>
      ),
      cell: ({ row }) => <span>{ParseDate(row.original.date)}</span>,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "remarks",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Remarks")}
        </Button>
      ),
      cell: ({ row }) => row.original.remarks,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Status")}
        </Button>
      ),
      cell: ({ row }) => row.original.status,
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: () => <span className="text-right">{t("Actions")}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDeletingItem(row.original);
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableGlobalFilter: false,
    },
  ];

  const table = useReactTable({
    data: inventories,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  if (isLoading || productsLoading) return <Spinner />;
  if (error || productsError)
    return <div>Error loading inventory or products</div>;

  // Modern UI
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Inventory")}
          </h1>
          <p className="text-muted-foreground">
            {t("Track and manage your stock levels")}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Add Inventory Item")}
        </Button>
      </div>

      {/* Global Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search inventory..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-muted/40 border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={
                      "px-4 py-2 text-left font-medium text-sm text-muted-foreground border-b border-gray-200" +
                      (header.column.id === "actions" ? " text-right" : "")
                    }
                    style={{
                      background: "#f9fafb",
                      fontWeight: 500,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-200">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 text-sm border-b border-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center border-b border-gray-200"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingItem(null);
            setForm({
              productId: "",
              item_length: "",
              item_width: "",
              item_lw_unit: "cm",
              weight: "",
              remarks: "",
              status: "active",
            });
            setErrors({});
            setProductSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the inventory information below."
                : "Add a new item to your inventory by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Popover
                open={productPopoverOpen}
                onOpenChange={setProductPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setProductPopoverOpen((v) => !v)}
                  >
                    {(() => {
                      const prod = products.find(
                        (p: Product) => p._id === form.productId
                      );
                      return prod ? (
                        <span>
                          {prod.name}
                          {prod.category && (
                            <Badge className="ml-2" variant="outline">
                              {prod.category}
                            </Badge>
                          )}
                        </span>
                      ) : (
                        "Select product"
                      );
                    })()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[350px]">
                  <Command>
                    <CommandInput
                      placeholder="Search product..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      {products.length === 0 && (
                        <CommandEmpty>No products found.</CommandEmpty>
                      )}
                      {products
                        .filter((prod: Product) =>
                          productSearch.trim() === ""
                            ? true
                            : prod.name
                                .toLowerCase()
                                .includes(productSearch.toLowerCase()) ||
                              prod.category
                                ?.toLowerCase()
                                .includes(productSearch.toLowerCase())
                        )
                        .map((prod: Product) => (
                          <CommandItem
                            key={prod._id}
                            value={prod.name}
                            onSelect={() => {
                              setForm((prev) => ({
                                ...prev,
                                productId: prod._id,
                              }));
                              setProductPopoverOpen(false);
                              setProductSearch("");
                            }}
                          >
                            <span>
                              {prod.name}
                              {prod.category && (
                                <Badge className="ml-2" variant="outline">
                                  {prod.category}
                                </Badge>
                              )}
                            </span>
                          </CommandItem>
                        ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.productId && (
                <p className="text-sm text-red-500">{errors.productId}</p>
              )}
            </div>
            {/* Length */}
            <div className="grid gap-2">
              <Label>Length</Label>
              <Input
                type="number"
                value={form.item_length}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, item_length: e.target.value }))
                }
                placeholder="Enter length"
              />
              {errors.item_length && (
                <p className="text-sm text-red-500">{errors.item_length}</p>
              )}
            </div>
            {/* Width */}
            <div className="grid gap-2">
              <Label>Width</Label>
              <Input
                type="number"
                value={form.item_width}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, item_width: e.target.value }))
                }
                placeholder="Enter width"
              />
              {errors.item_width && (
                <p className="text-sm text-red-500">{errors.item_width}</p>
              )}
            </div>
            {/* Unit */}
            <div className="grid gap-2">
              <Label>Unit</Label>
              <Select
                value={form.item_lw_unit}
                onValueChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    item_lw_unit: val as "cm" | "inch",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inch">Inch</SelectItem>
                  <SelectItem value="cm">Centimeter</SelectItem>
                </SelectContent>
              </Select>
              {errors.item_lw_unit && (
                <p className="text-sm text-red-500">{errors.item_lw_unit}</p>
              )}
            </div>
            {/* Weight */}
            {selectedProduct?.type === "reel" && (
              <div className="grid gap-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  placeholder="Enter weight in kg"
                />
                {errors.weight && (
                  <p className="text-sm text-red-500">{errors.weight}</p>
                )}
              </div>
            )}
            {selectedProduct?.type === "bundle" && (
              <div className="grid gap-2">
                <Label>GSM</Label>
                <Input type="number" value={selectedProduct.gsm} disabled />
                <Label>Calculated Weight (kg)</Label>
                <Input type="number" value={calcBundleWeight()} disabled />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                type="text"
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Remarks"
              />
            </div>
            {editingItem && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as "active" | "inactive",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingItem(null);
                setForm({
                  productId: "",
                  item_length: "",
                  item_width: "",
                  item_lw_unit: "cm",
                  weight: "",
                  remarks: "",
                  status: "active",
                });
                setErrors({});
                setProductSearch("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              inventory entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default InventoryPage;
