"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import ParseDate from "@/utils/parseDate.ts";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, updateLead, Lead } from "@/services/leads";
import { getInventories, Inventory } from "@/services/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

// Local helper types for quote structure used in this page
interface QuoteProduct {
  _id?: string;
  name?: string;
  type?: string;
  category?: string;
}
interface QuoteItem {
  product?: QuoteProduct;
  weight?: number | string;
  quantity?: number | string;
}
type LeadStatus = "open" | "converted" | "closed";
// Use an intersection type so we don't weaken required fields from Lead
type LeadRow = Lead & {
  createdAt?: string | Date;
  status?: LeadStatus;
  message?: string;
  quote?: { items?: QuoteItem[] };
};

export default function LeadsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // TanStack Query for leads list
  const {
    data: leads = [],
    isLoading,
    isError,
    error,
  } = useQuery<Lead[], Error>({ queryKey: ["leads"], queryFn: fetchLeads });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [viewLead, setViewLead] = useState<LeadRow | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<LeadRow | null>(null);
  const [quoteInventories, setQuoteInventories] = useState<
    Record<string, Inventory | null>
  >({});

  // Open view dialog and fetch current inventory for quote items
  const handleView = useCallback(async (lead: LeadRow) => {
    setViewLead(lead);
    if (lead?.quote?.items?.length) {
      const inventories = await getInventories();
      const invMap: Record<string, Inventory | null> = {};
      (lead.quote.items as QuoteItem[]).forEach((item) => {
        const prodId = item.product?._id;
        if (prodId) {
          invMap[prodId] =
            inventories.find((inv) => inv.productId === prodId) || null;
        }
      });
      setQuoteInventories(invMap);
    } else {
      setQuoteInventories({});
    }
  }, []);

  // Open edit dialog
  const handleEdit = useCallback((lead: LeadRow) => {
    setEditForm({ ...lead, status: (lead.status ?? "open") as LeadStatus });
    setEditDialogOpen(true);
  }, []);

  // Update mutation (typed payload with id + data)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated", {
        description: "The lead was updated successfully.",
      });
    },
    onError: () => {
      toast.error("Error", { description: "Failed to update lead" });
    },
  });

  // Save edited lead
  const handleEditSave = async () => {
    if (!editForm?._id) return;
    await updateMutation.mutateAsync({
      id: String(editForm._id),
      data: editForm as Partial<Lead>,
    });
    setEditDialogOpen(false);
  };

  const columns: ColumnDef<LeadRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Name")}
        </Button>
      ),
      cell: ({ row }) => row.original.name,
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
      cell: ({ row }) => row.original.email,
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
      cell: ({ row }) => row.original.phone,
    },
    {
      accessorKey: "company",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Company Name")}
        </Button>
      ),
      cell: ({ row }) => row.original.company,
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
      cell: ({ row }) => {
        const status = row.original.status ?? "";
        let variant: "default" | "secondary" | "outline" = "default";
        let className = "";
        if (status === "converted") {
          variant = "default";
          className = "bg-blue-100 text-blue-800 border-blue-200";
        } else if (status === "open") {
          variant = "default";
          className = "bg-green-100 text-green-800 border-green-200";
        } else {
          variant = "secondary";
          className = "";
        }
        return (
          <Badge variant={variant} className={className}>
            {status}
          </Badge>
        );
      },
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
      cell: ({ row }) => (
        <span>
          {ParseDate(
            typeof row.original.createdAt === "string"
              ? row.original.createdAt
              : (row.original.createdAt as Date | undefined)?.toISOString?.() ||
                  ""
          )}
        </span>
      ),
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("Message")}
        </Button>
      ),
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] block">
          {row.original.message}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-right">{t("Actions")}</span>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row.original)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: leads as LeadRow[],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-red-500">
        {error?.message || "Failed to load leads"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("Enquiries")}
          </h1>
          <p className="text-muted-foreground">
            {t("Manage your customer enquiries")}
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search enquiries..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                {[10, 20, 30, 40, 50].map((pageSize) => (
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

      {/* View Lead Dialog */}
      <Dialog open={!!viewLead} onOpenChange={() => setViewLead(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl backdrop-blur max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Enquiry Details")}</DialogTitle>
          </DialogHeader>
          {viewLead && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">{t("Name")}:</span>{" "}
                {viewLead.name}
              </div>
              <div>
                <span className="font-semibold">{t("Email")}:</span>{" "}
                {viewLead.email}
              </div>
              <div>
                <span className="font-semibold">{t("Phone")}:</span>{" "}
                {viewLead.phone}
              </div>
              <div>
                <span className="font-semibold">{t("Company Name")}:</span>{" "}
                {viewLead.company}
              </div>
              <div>
                <span className="font-semibold">{t("Status")}:</span>{" "}
                <Badge
                  variant={
                    viewLead.status === "converted"
                      ? "default"
                      : viewLead.status === "open"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    viewLead.status === "converted"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : ""
                  }
                >
                  {viewLead.status}
                </Badge>
              </div>
              <div>
                <span className="font-semibold">{t("Message")}:</span>
                <div className="bg-muted rounded p-2 mt-1">
                  {viewLead.message}
                </div>
              </div>
              {viewLead.quote && viewLead.quote.items && (
                <div>
                  <span className="font-semibold">{t("Quote Items")}:</span>
                  <div className="mt-2 -mx-4 sm:mx-0 overflow-x-auto md:overflow-x-visible">
                    <Table className="text-sm min-w-[680px] md:min-w-0">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Product")}</TableHead>
                          <TableHead>{t("Type")}</TableHead>
                          <TableHead>{t("Category")}</TableHead>
                          <TableHead>{t("Weight")}</TableHead>
                          <TableHead>{t("Qty")}</TableHead>
                          <TableHead>{t("Current Inventory")}</TableHead>
                          <TableHead>{t("Fulfillable")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(viewLead.quote.items as QuoteItem[]).map(
                          (item, idx) => {
                            const prodId = item.product?._id;
                            const inv = prodId
                              ? quoteInventories[prodId]
                              : null;
                            const fulfillable =
                              inv &&
                              Number(inv.quantity) >= Number(item.quantity);
                            return (
                              <TableRow
                                key={idx}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <TableCell>{item.product?.name}</TableCell>
                                <TableCell>{item.product?.type}</TableCell>
                                <TableCell>{item.product?.category}</TableCell>
                                <TableCell>{item.weight}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {inv ? (
                                    `${inv.quantity} (${inv.status})`
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {fulfillable ? (
                                    <span className="inline-flex items-center text-green-600">
                                      <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                      {t("Yes")}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center text-orange-600">
                                      <AlertTriangle className="w-4 h-4 mr-1" />{" "}
                                      {t("No")}
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLead(null)}>
              {t("Close")}
            </Button>
            <Button
              onClick={() => {
                setEditForm(viewLead);
                setEditDialogOpen(true);
                setViewLead(null);
              }}
            >
              {t("Edit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg backdrop-blur">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, phone: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, company: e.target.value } : prev
                    )
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: string) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, status: val as LeadStatus } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Message</Label>
                <Input
                  value={editForm.message ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) =>
                      prev ? { ...prev, message: e.target.value } : prev
                    )
                  }
                />
              </div>
              {editForm.quote && editForm.quote.items && (
                <div>
                  <Label>Quote Items</Label>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 border">Product</th>
                          <th className="px-2 py-1 border">Type</th>
                          <th className="px-2 py-1 border">Category</th>
                          <th className="px-2 py-1 border">Weight</th>
                          <th className="px-2 py-1 border">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(editForm.quote.items as QuoteItem[]).map(
                          (item, idx) => (
                            <tr key={idx}>
                              <td className="px-2 py-1 border">
                                <Input
                                  value={item.product?.name || ""}
                                  onChange={(e) => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const items = [
                                        ...(prev.quote?.items ?? []),
                                      ] as QuoteItem[];
                                      const existing = items[idx] ?? {};
                                      items[idx] = {
                                        ...existing,
                                        product: {
                                          ...(existing.product ?? {}),
                                          name: e.target.value,
                                        },
                                      };
                                      return {
                                        ...prev,
                                        quote: { ...(prev.quote ?? {}), items },
                                      };
                                    });
                                  }}
                                />
                              </td>
                              <td className="px-2 py-1 border">
                                <Input
                                  value={item.product?.type || ""}
                                  onChange={(e) => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const items = [
                                        ...(prev.quote?.items ?? []),
                                      ] as QuoteItem[];
                                      const existing = items[idx] ?? {};
                                      items[idx] = {
                                        ...existing,
                                        product: {
                                          ...(existing.product ?? {}),
                                          type: e.target.value,
                                        },
                                      };
                                      return {
                                        ...prev,
                                        quote: { ...(prev.quote ?? {}), items },
                                      };
                                    });
                                  }}
                                />
                              </td>
                              <td className="px-2 py-1 border">
                                <Input
                                  value={item.product?.category || ""}
                                  onChange={(e) => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const items = [
                                        ...(prev.quote?.items ?? []),
                                      ] as QuoteItem[];
                                      const existing = items[idx] ?? {};
                                      items[idx] = {
                                        ...existing,
                                        product: {
                                          ...(existing.product ?? {}),
                                          category: e.target.value,
                                        },
                                      };
                                      return {
                                        ...prev,
                                        quote: { ...(prev.quote ?? {}), items },
                                      };
                                    });
                                  }}
                                />
                              </td>
                              <td className="px-2 py-1 border">
                                <Input
                                  value={String(item.weight ?? "")}
                                  onChange={(e) => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const items = [
                                        ...(prev.quote?.items ?? []),
                                      ] as QuoteItem[];
                                      const existing = items[idx] ?? {};
                                      items[idx] = {
                                        ...existing,
                                        weight: e.target.value,
                                      };
                                      return {
                                        ...prev,
                                        quote: { ...(prev.quote ?? {}), items },
                                      };
                                    });
                                  }}
                                />
                              </td>
                              <td className="px-2 py-1 border">
                                <Input
                                  value={String(item.quantity ?? "")}
                                  onChange={(e) => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const items = [
                                        ...(prev.quote?.items ?? []),
                                      ] as QuoteItem[];
                                      const existing = items[idx] ?? {};
                                      items[idx] = {
                                        ...existing,
                                        quantity: e.target.value,
                                      };
                                      return {
                                        ...prev,
                                        quote: { ...(prev.quote ?? {}), items },
                                      };
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
