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

function InventoryPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [deletingItem, setDeletingItem] = useState<Inventory | null>(null);
  const [form, setForm] = useState<Partial<Inventory>>({
    productId: "",
    quantity: 0,
    date: "",
    remarks: "",
    status: "active",
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

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

  const isFormValid =
    form.productId &&
    form.quantity &&
    form.date &&
    form.status &&
    !isNaN(Number(form.quantity)) &&
    Object.keys(errors).length === 0;

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.productId) newErrors.productId = "Product is required";
    if (
      !form.quantity ||
      isNaN(Number(form.quantity)) ||
      Number(form.quantity) < 0
    )
      newErrors.quantity = "Quantity must be a valid non-negative number";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    if (editingItem) {
      await updateMutation.mutateAsync({ ...editingItem, ...form });
      setEditingItem(null);
    } else {
      await createMutation.mutateAsync(form as Inventory);
    }
    setForm({
      productId: "",
      quantity: 0,
      date: "",
      remarks: "",
      status: "active",
    });
    setIsDialogOpen(false);
    setSubmitting(false);
    setErrors({});
  };

  const handleEdit = (inv: Inventory) => {
    setEditingItem(inv);
    setForm({
      productId: inv.productId,
      quantity: inv.quantity,
      date: inv.date.slice(0, 10),
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
          Product
        </Button>
      ),
      cell: ({ row }) =>
        products.find((p: Product) => p.id === row.original.productId)?.name ||
        row.original.productId,
      enableGlobalFilter: true,
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
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
          Date
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
          Remarks
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
          Status
        </Button>
      ),
      cell: ({ row }) => row.original.status,
      enableGlobalFilter: true,
    },
    {
      id: "actions",
      header: () => <span className="text-right">Actions</span>,
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage your stock levels
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Inventory Item
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
              quantity: 0,
              date: "",
              remarks: "",
              status: "active",
            });
            setErrors({});
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
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={form.productId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, productId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod: Product) => (
                    <SelectItem
                      key={prod.id || prod.name}
                      value={prod.id || ""}
                    >
                      {prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-500">{errors.productId}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={form.quantity || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quantity: +e.target.value }))
                }
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                type="text"
                value={form.remarks || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, remarks: e.target.value }))
                }
                placeholder="Remarks"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status || "active"}
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingItem(null);
                setForm({
                  productId: "",
                  quantity: 0,
                  date: "",
                  remarks: "",
                  status: "active",
                });
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
            >
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
