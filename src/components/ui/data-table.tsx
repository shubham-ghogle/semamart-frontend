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
  enableStatusFilter?: boolean;
  statusColumnId?: string;
  statusOptions?: string[];
  onVisibilityChange?: (proIds: string[], isVisible: boolean) => void;
  getRowClassName?: (row: TData) => string;
  disableExport?: boolean;
  disableColumnVisibility?: boolean;
  enableSalesmanFilter?: boolean;
  salesmanOptions?: string[];
  salesmanColumnId?: string;
  disablePagination?: boolean;
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
  enableStatusFilter = false,
  statusColumnId,
  statusOptions = ["All", "Created", "Processing", "Shipped", "Delivered"],
  getRowClassName,
  disableExport = false,
  disableColumnVisibility = false,
  enableSalesmanFilter = false,
  salesmanOptions = [],
  salesmanColumnId = "salesman",
  disablePagination = false,
}: DataTableProps<TData, TValue>) {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = useState({});

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
    getPaginationRowModel: !disablePagination ? getPaginationRowModel() : getCoreRowModel(),
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

   let logoDataUrl: string | null = null;
let logoAspect = 1;
let logoReady = false;

(function preloadAndOptimizeLogo() {
  const img = new Image();
  img.src = "/logo.png";

  img.onload = () => {
    const TARGET_WIDTH = 160; // exact display width in PDF
    const scale = TARGET_WIDTH / img.naturalWidth;

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_WIDTH;
    canvas.height = img.naturalHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 👉 PNG keeps logo sharp (still small because canvas is small)
    logoDataUrl = canvas.toDataURL("image/png");
    logoAspect = canvas.height / canvas.width;
    logoReady = true;
  };
})();

  const formatDate = (d = new Date()) =>
  d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });


  function exportPdf() {
  // create doc in landscape to match table width
  const doc = new jsPDF({ orientation: "landscape", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // design constants (keeps header compact and at the extreme top)
  const MARGIN = 14; // left & right
  const HEADER_HEIGHT = 60; // moderate compact header
  const FOOTER_HEIGHT = 48;
  const CONTENT_START_Y = HEADER_HEIGHT + 12;
  const BRAND_TEAL = "#1C6C84";
  const BRAND_ORANGE = "#F9A11B";
  const TEXT_COLOR = "#222222";

  const contact = "SEMA Healthcare Private Limited | info@semamart.com | GST: 07ABKCS8538F1ZX";
  const phone = "+91 93196 54455 | +91 73037 69555";

  // draw header + footer for a given page (uses autoTable's data.pageNumber)
  function drawHeaderAndFooter(data: any) {
    const pageNumber = data.pageNumber ?? 1;

    // Header: white background and thin brand lines
    doc.setFillColor("#ffffff");
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

    doc.setDrawColor(BRAND_TEAL);
    doc.setLineWidth(3);
    doc.line(0, 6, pageWidth, 6);

    doc.setDrawColor(BRAND_ORANGE);
    doc.setLineWidth(3);
    doc.line(0, HEADER_HEIGHT - 6, pageWidth, HEADER_HEIGHT - 6);

    // Center emblem + brand text (simple and reliable in browser)
    const headerCenterY = HEADER_HEIGHT / 2;

// LEFT: Logo
if (logoReady && logoDataUrl) {
  const logoWidth = 120; // slightly smaller for left placement
  const logoHeight = logoWidth * logoAspect;

  const logoX = MARGIN;
  const logoY = headerCenterY - logoHeight / 2;

  doc.addImage(
    logoDataUrl,
    "PNG",
    logoX,
    logoY,
    logoWidth,
    logoHeight,
    "SEMA_LOGO"
  );
}

// CENTER: Report / Table name
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(BRAND_TEAL);
doc.text(
  `${docName} Report`,
  pageWidth / 2,
  headerCenterY + 5,
  { align: "center" }
);

// RIGHT: Created date
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(TEXT_COLOR);
doc.text(
  `Created at: ${formatDate()}`,
  pageWidth - MARGIN,
  headerCenterY + 4,
  { align: "right" }
);



    // Footer
    const footerTopY = pageHeight - FOOTER_HEIGHT + 8;
    doc.setDrawColor("#e6e6e6");
    doc.setLineWidth(0.5);
    doc.line(MARGIN, footerTopY - 6, pageWidth - MARGIN, footerTopY - 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor("#6b7280");
    doc.text(contact, pageWidth / 2, footerTopY + 6, {
      maxWidth: pageWidth - MARGIN * 2,
      align: "center",
    });

    doc.text(phone, pageWidth / 2, footerTopY + 20, {
      maxWidth: pageWidth - MARGIN * 2,
      align: "center",
    });

    doc.setFontSize(9);
    doc.setTextColor(TEXT_COLOR);
    doc.text(`Page ${pageNumber}`, pageWidth - MARGIN, footerTopY + 20, {
      align: "right",
    });
  }

  // Build table head and rows exactly as your existing logic
  const head = [tableHeader];
  const body = rows;

  autoTable(doc, {
    startY: CONTENT_START_Y,
    head,
    body,
    margin: { left: MARGIN, right: MARGIN, top: CONTENT_START_Y, bottom: FOOTER_HEIGHT + 8 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [64, 117, 140], // matches your theme
      textColor: 255,
      halign: "left",
    },
    didDrawPage: function (data) {
      // use data.pageNumber from autoTable (also avoids doc.internal typing issues)
      drawHeaderAndFooter(data);
    },
    // keep column widths automatic to preserve layout like the UI table
  });

  const filename = docName.replace(/\s+/g, "_") + ".pdf";
  doc.save(filename);
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
   <div className="w-full px-2">
      {/* Filter bar - horizontal scroll */}
      <section
        className="mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Search */}
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
            className="flex-1 min-w-[200px] shrink-0"
          />
        )}
        
        {/* All filters - visible on all screens */}
        {!disableBtns && (
          <div className="flex items-center gap-2 shrink-0">
            {!disabeAdminVisibilitySwitch && selectedRows.rows.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
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
                <Label htmlFor="admin-prodcut-visibiity" className="text-xs whitespace-nowrap">
                  Switch product visibility
                </Label>
              </div>
            )}

            {!disabeSellerVisibilitySwitch && selectedRows.rows.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
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
                <Label htmlFor="seller-prodcut-visibiity" className="text-xs whitespace-nowrap">
                  Switch product visibility
                </Label>
              </div>
            )}
            
            {/* Status filter */}
            {enableStatusFilter && statusColumnId && (
              <Select
                value={
                  (table.getColumn(statusColumnId)?.getFilterValue() as string) ??
                  "All"
                }
                onValueChange={v =>
                  table
                    .getColumn(statusColumnId)
                    ?.setFilterValue(v === "All" ? undefined : v)
                }
              >
                <SelectTrigger className="w-28 shrink-0 h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Date filter */}
            {enableCalender && (
              <div className="min-w-fit shrink-0">
                <CalendarPopoverWithPresets
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  minDate={minDate}
                />
              </div>
            )}
            {/* salesman filter */}
            {enableSalesmanFilter && salesmanOptions.length > 0 && (
              <Select
                value={
                  (table.getColumn(salesmanColumnId)?.getFilterValue() as string) ??
                  "All"
                }
                onValueChange={v =>
                  table
                    .getColumn(salesmanColumnId)
                    ?.setFilterValue(v === "All" ? undefined : v)
                }
              >
                <SelectTrigger className="w-28 min-w-[112px] shrink-0 hidden sm:flex">
                  <SelectValue placeholder="Salesman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="All" value="All">All</SelectItem>
                  {salesmanOptions.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* export buttons */}
            {!disableExport && (
              <div className="min-w-fit shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-background text-txt-drk-gray whitespace-nowrap h-9"
                    >
                      <DownloadIcon size={16} />
                      <span>Export</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportPdf}>PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={exportCsv}>CSV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

{/* column visibility */}
            {!disableColumnVisibility && (
              <div className="min-w-fit shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-background text-txt-drk-gray whitespace-nowrap h-9"
                    >
                      <FilterIcon size={16} />
                      <span>Columns</span>
                      <ChevronDown size={14} />
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
            )}
          </div>
        )}
      </section>

      <div className="w-full max-w-full rounded-md border overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-background">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-custom-blue font-medium  bg-[#f5f6fa]",
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
                  className={getRowClassName ? getRowClassName(row.original) : ""}
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
      {!disablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
          <div className="flex items-center space-x-2 order-2 sm:order-1">
            <span className="text-sm whitespace-nowrap">Rows per page:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
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

          <div className="text-sm text-muted-foreground order-1 sm:order-2">
            {`${start}–${end} of ${total}`}
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center space-x-2 order-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
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
