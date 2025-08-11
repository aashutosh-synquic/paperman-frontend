"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
// import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Loader2, Mail, Phone, Eye } from "lucide-react";
import { toast } from "sonner";
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
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  CustomerView,
  BaseCustomer,
} from "../../services/customers";
import ParseDate from "@/utils/parseDate.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Add a narrow extension type to avoid any casts
type CustomerExtended = CustomerView &
  Partial<{
    gstNumber: string;
    address: string;
    orders: string[];
  }>;

export default function CustomersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerView | null>(
    null
  );
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerView | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  // Align form data with services/customers BaseCustomer shape (include required fields)
  const [formData, setFormData] = useState<BaseCustomer>({
    firstName: "",
    lastName: "",
    companyName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    enquiries: [],
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [viewCustomer, setViewCustomer] = useState<CustomerView | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Data fetching via TanStack Query
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: BaseCustomer) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Created", { description: "Customer added successfully" });
    },
    onError: () =>
      toast.error("Error", { description: "Failed to create customer" }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { _id: string } & BaseCustomer) =>
      updateCustomer(payload._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Updated", {
        description: "Customer updated successfully",
      });
    },
    onError: () =>
      toast.error("Error", { description: "Failed to update customer" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Deleted", {
        description: "Customer deleted successfully",
      });
    },
    onError: () =>
      toast.error("Error", { description: "Failed to delete customer" }),
  });

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          _id: editingCustomer._id,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleCloseDialog();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer: CustomerView) => {
    setEditingCustomer(customer);
    const c = customer as CustomerExtended;
    setFormData({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      companyName: customer.companyName ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      gstNumber: c.gstNumber ?? "",
      address: c.address ?? "",
      enquiries: Array.isArray(customer.enquiries)
        ? (customer.enquiries as string[])
        : [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    await deleteMutation.mutateAsync(deletingCustomer._id);
    setIsDeleteDialogOpen(false);
    setDeletingCustomer(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      phone: "",
      email: "",
      gstNumber: "",
      address: "",
      enquiries: [],
    });
  };

  // Table columns
  const columns: ColumnDef<CustomerView>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Name")}
        </Button>
      ),
      cell: ({ row }) =>
        row.original.firstName + " " + row.original.lastName || "-",
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Company")}
        </Button>
      ),
      cell: ({ row }) => row.original.companyName || "-",
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Phone")}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-3 h-3" />
          {row.original.phone || "-"}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Email")}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-3 h-3" />
          {row.original.email || "-"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Created At")}
        </Button>
      ),
      cell: ({ row }) => <span>{ParseDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "enquiries",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Enquiries")}
        </Button>
      ),
      cell: ({ row }) => {
        const leads = Array.isArray(row.original.enquiries)
          ? (row.original.enquiries as string[])
          : [];
        return <span>{leads.length}</span>;
      },
    },
    {
      accessorKey: "orders",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Orders")}
        </Button>
      ),
      cell: ({ row }) => {
        const orders = Array.isArray((row.original as CustomerExtended).orders)
          ? ((row.original as CustomerExtended).orders as string[])
          : [];
        return <span>{orders.length}</span>;
      },
    },
    {
      id: "actions",
      header: () => <span className="text-right">{t("Actions")}</span>,
      cell: ({ row }) => (
        <div className="text-right space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          {/* <Button
            variant="outline"
            size="icon"
            onClick={() => openDeleteDialog(row.original)}
          >
            <Trash2 className="w-4 h-4" />
          </Button> */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setViewCustomer(row.original);
              setModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div>Error loading customers</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Customers")}
          </h1>
          <p className="text-muted-foreground">
            {t("Manage your customer database")}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Add New Customer")}
        </Button>
      </div>

      {/* Global Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search customers..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Only the table scrolls horizontally */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted ">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "px-2 py-1.5 text-left font-medium text-xs sm:text-sm text-muted-foreground border-b border-gray-200 whitespace-nowrap",
                        header.column.id === "actions" && "w-24 text-right",
                        (header.column.id === "enquiries" ||
                          header.column.id === "orders") &&
                          "px-2 w-16 text-center"
                      )}
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
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="[&_[data-slot=table-cell]:first-child]:w-8">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-2 py-1.5 text-xs sm:text-sm border-b border-gray-200 whitespace-nowrap",
                          cell.column.id === "actions" && "w-24",
                          (cell.column.id === "enquiries" ||
                            cell.column.id === "orders") &&
                            "px-2 w-16 text-center tabular-nums"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center border-b border-gray-200"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2">
        <div className="hidden flex-1 text-sm lg:flex">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              size="icon"
              className="hidden h-8 w-8 p-0 lg:flex"
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? "Update customer details."
                : "Enter details for the new customer."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            {/* <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div> */}
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this customer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customer Info Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Customer Details")}</DialogTitle>
          </DialogHeader>
          {viewCustomer && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">{t("Name")}:</span>{" "}
                {viewCustomer.firstName + " " + viewCustomer.lastName}
              </div>
              {/* <div>
                <span className="font-semibold">Last Name:</span>{" "}
                {viewCustomer.lastName}
              </div> */}
              <div>
                <span className="font-semibold">{t("Company")}:</span>{" "}
                {viewCustomer.companyName}
              </div>
              <div>
                <span className="font-semibold">{t("Phone")}:</span>{" "}
                {viewCustomer.phone}
              </div>
              <div>
                <span className="font-semibold">{t("Email")}:</span>{" "}
                {viewCustomer.email}
              </div>
              <div>
                <span className="font-semibold">{t("Enquiries")}:</span>{" "}
                {(() => {
                  const enquiries = Array.isArray(viewCustomer.enquiries)
                    ? (viewCustomer.enquiries as string[])
                    : [];
                  return enquiries.length > 0
                    ? enquiries.map((id: string, idx: number) => (
                        <span key={id}>
                          <a
                            href={`/dashboard/leads?id=${id}`}
                            className="text-blue-600 underline"
                          >
                            {id.slice(-5)}
                          </a>
                          {idx < enquiries.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "-";
                })()}
              </div>
              <div>
                <span className="font-semibold">{t("Orders")}:</span>{" "}
                {(() => {
                  const orders = Array.isArray(
                    (viewCustomer as CustomerExtended).orders
                  )
                    ? ((viewCustomer as CustomerExtended).orders as string[])
                    : [];
                  return orders.length > 0
                    ? orders.map((id: string, idx: number) => (
                        <span key={id}>
                          <a
                            href={`/dashboard/orders?id=${id}`}
                            className="text-green-600 underline"
                          >
                            {id.slice(-5)}
                          </a>
                          {idx < orders.length - 1 ? ", " : ""}
                        </span>
                      ))
                    : "-";
                })()}
              </div>
              <div>
                <span className="font-semibold">{t("Created At")}:</span>{" "}
                {viewCustomer.createdAt
                  ? new Date(viewCustomer.createdAt).toLocaleString()
                  : "-"}
              </div>
              <div>
                <span className="font-semibold">{t("Updated At")}:</span>{" "}
                {viewCustomer.updatedAt
                  ? new Date(viewCustomer.updatedAt).toLocaleString()
                  : "-"}
              </div>
              <DialogFooter>
                <Button onClick={() => setModalOpen(false)}>
                  {t("Close")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
