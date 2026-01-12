import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

// import reportLogo from "../../assets/report_logo.png"
// import semaLogo from "../../assets/report_sema.png"
// import rgtFooter from "../../assets/report_footer_rht.png"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  FilterIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Input } from "./input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { CalendarPopoverWithPresets } from "../UIComponents/CalendarPopoverWithPresets";
import { Switch } from "./switch";
import { Label } from "./label";
// import { useQueryClient } from "@tanstack/react-query"
// import { Hospital } from "@/types"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  disableSearch?: boolean;
  disableBtns?: boolean;
  searchColId?: string;
  searchPlaceholder?: string;
  bordered?: boolean;
  enableCalender?: boolean;
  dateFieldId?: string;
  docName: string;
  disabeAdminVisibilitySwitch?: boolean;
  disabeSellerVisibilitySwitch?: boolean;
  onVisibilityChange?: (proIds: string[], isVisible: boolean) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  disableSearch = false,
  disableBtns = false,
  searchColId = "productName",
  searchPlaceholder = "Search product...",
  bordered = false,
  enableCalender = false,
  dateFieldId = "date",
  docName,
  disabeAdminVisibilitySwitch = true,
  disabeSellerVisibilitySwitch = true,
  onVisibilityChange,
}: DataTableProps<TData, TValue>) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = useState({});

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const statusOptions = [
    "All",  "Created", "Processing", "Shipped", "Delivered"
  ];


  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const normalizeDate = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const filteredData = useMemo(() => {
    if (!startDate || !endDate) {
      return data;
    }

    const normalizedStart = normalizeDate(startDate);
    const normalizedEnd = normalizeDate(endDate);

    return data.filter((row: any) => {
      const rawDate = row[dateFieldId];
      if (!rawDate) {
        return false;
      }

      const rowDate = parseDate(rawDate);
      if (!rowDate || isNaN(rowDate.getTime())) {
        return false;
      }

      const normalizedRowDate = normalizeDate(rowDate);
      return (
        normalizedRowDate >= normalizedStart &&
        normalizedRowDate <= normalizedEnd
      );
    });
  }, [data, startDate, endDate]);

  const minDate: Date = useMemo(() => {
    if (!data || data.length === 0) return new Date();

    return data.reduce((min, row: any) => {
      const rawDate = row[dateFieldId];
      const dateObj = parseDate(rawDate);
      if (!dateObj) return min;
      return !min || dateObj < min ? dateObj : min;
    }, new Date());
  }, [data, dateFieldId]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
    },
  });

  // NOTE: to access selected rows
  const visibleColumns = table
    .getVisibleFlatColumns()
    .filter((col) => col.id !== "select")
    .map((col) => col.id);

  const selectedRows = table.getFilteredSelectedRowModel();
  const selectedData = selectedRows.rows.map((row) => {
    const filteredRow: Record<string, any> = {};
    visibleColumns.forEach((colId) => {
      if (colId === "select") return;
      if (colId === "action") return;
      filteredRow[colId] = row.getValue(colId);
    });
    return filteredRow;
  });

  const tableHeader = table
    .getFlatHeaders()
    .filter((col) => col.id !== "select" && col.id !== "action")
    .map((col) => col.column.columnDef.header as string);
  const rows = selectedData.map((row) => visibleColumns.map((col) => row[col]));

  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    const date = new Date().toLocaleDateString("en-IN");

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(docName + " Report", 11, 20);

    doc.setDrawColor(150);
    doc.line(14, 25, pageWidth - 14, 25);

    const hospitalTextY = 32;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Hospital Name: ", 14, hospitalTextY);
    doc.setFont("helvetica", "normal");

    const hosAddTextY = 38;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Hospital Address: ", 14, hosAddTextY);
    doc.setFont("helvetica", "normal");

    const dateY = 44;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Date: ", 14, dateY);
    doc.setFont("helvetica", "normal");
    doc.text(date, 17 + doc.getTextWidth("Date: "), dateY);

    doc.setDrawColor(150);
    doc.line(14, 50, pageWidth - 14, 50);

    autoTable(doc, {
      startY: 54,
      head: [tableHeader],
      headStyles: {
        fillColor: [64, 117, 140],
      },
      body: rows,
    });

    doc.save(docName.replace(" ", "_"));
  }

  function exportCsv() {
    const rowsForCsv = rows.map((row: (string | undefined)[]) => {
      return row
        .filter((cell) => cell !== undefined)
        .map((cell) =>
          typeof cell === "string"
            ? cell.replace(/ /g, "_").replace(/"/g, "")
            : cell
        );
    });

    const a = rowsForCsv.map((el) => el.join(" "));

    const headersForCsv = tableHeader.map((el) => el.replace(" ", "_"));

    const csvContent = [headersForCsv.join(" "), ...a].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", docName.replace(" ", "_") + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = table.getRowCount();
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(total, (pageIndex + 1) * pageSize);

  return (
    <div className="w-full">
      <section
        className={
          "mb-4 flex items-center " +
          (disableSearch ? "justify-end" : "justify-between")
        }
      >
        {/* serach input */}
        {!disableSearch && (
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColId)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchColId)?.setFilterValue(event.target.value)
            }
            className="max-w-sm p-2 border rounded"
          />
        )}

        {!disableBtns && (
          <article className="flex items-center gap-3 overflow-x-auto w-full justify-end flex-wrap sm:flex-nowrap">
            {!disabeAdminVisibilitySwitch && selectedRows.rows.length > 0 && (
              <article className="justify-self-end flex items-center gap-1">
                <Switch
                  id="admin-prodcut-visibiity"
                  onCheckedChange={(e) => {
                    const proIds = selectedRows.flatRows.map(
                      (el) => (el.original as any).productId
                    );
                    if (onVisibilityChange) {
                      onVisibilityChange(proIds, e);
                    }
                  }}
                />
                <Label htmlFor="admin-prodcut-visibiity">
                  Switch product visibility
                </Label>
              </article>
            )}

            {!disabeSellerVisibilitySwitch && selectedRows.rows.length > 0 && (
              <article className="justify-self-end flex items-center gap-1">
                <Switch
                  id="seller-prodcut-visibiity"
                  onCheckedChange={(e) => {
                    const proIds = selectedRows.flatRows.map(
                      (el) => (el.original as any).productId
                    );
                    if (onVisibilityChange) {
                      onVisibilityChange(proIds, e);
                    }
                  }}
                />
                <Label htmlFor="seller-prodcut-visibiity">
                  Switch product visibility
                </Label>
              </article>
            )}
            
             <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? "All"
              }
              onValueChange={(value) => {
                if (value === "All") {
                  table.getColumn("status")?.setFilterValue(undefined);
                } else {
                  table.getColumn("status")?.setFilterValue(value);
                }
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
         

            {enableCalender && (
              <div className="min-w-fit">
                <CalendarPopoverWithPresets
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  minDate={minDate}
                />
              </div>
            )}
            {/* export buttons */}
            <div className="min-w-fit">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-auto bg-background text-txt-drk-gray"
                  >
                    <DownloadIcon />
                    <span>Export</span>
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportPdf}>PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv}>CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* column visibility */}
            <div className="min-w-fit">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="ml-auto bg-background text-txt-drk-gray"
                  >
                    <FilterIcon />
                    Columns
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.columnDef.header as string}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </article>
        )}
      </section>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-background">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-[#1C647C] font-medium  bg-[#f5f6fa]",
                        bordered && "border"
                      )}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "text-sm text-[#000000]",
                        bordered && "border"
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Control */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Rows per page:</span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {`${start}–${end} of ${total} results`}
        </div>

        {/* Prev / Next Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function EmergencyCell({ text }: { text: string }) {
  return (
    <p
      className={
        "flex items-center gap-1 " +
        (text === "Critical" ? "text-red-500" : "text-green-600")
      }
    >
      <span
        className={
          "h-2 aspect-square rounded-full " +
          (text === "Critical" ? "bg-red-500" : "bg-green-600")
        }
      ></span>
      <span> {text}</span>
    </p>
  );
}
