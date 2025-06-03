"use client";

import { useState, useMemo } from "react";
import { Input } from "./input";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import {
  searchData,
  filterData,
  sortData,
  paginateData,
} from "@/lib/data/loadSeedData";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  options?: { label: string; value: any }[];
  render?: (value: any, row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  pageSize?: number;
  title?: string;
  description?: string;
  className?: string;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  pageSize = 10,
  title,
  description,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get searchable columns
  const searchableColumns = useMemo(
    () => columns.filter((col) => col.searchable).map((col) => col.key),
    [columns]
  );

  // Apply search, filters, and sorting
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchableColumns.length > 0) {
      result = searchData(result, searchTerm, searchableColumns);
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterData(result, filters);
    }

    // Apply sorting
    if (sortConfig) {
      result = sortData(result, sortConfig.key, sortConfig.direction);
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, searchableColumns]);

  // Apply pagination
  const {
    data: paginatedData,
    total,
    totalPages,
  } = useMemo(
    () => paginateData(processedData, currentPage, pageSize),
    [processedData, currentPage, pageSize]
  );

  // Handle sort click
  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof T, value: any) => {
    setFilters((current) => ({
      ...current,
      [key]: value === "__all__" ? undefined : value,
    }));
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (key: keyof T) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {searchableColumns.length > 0 && (
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            )}
            {columns
              .filter((col) => col.filterable && col.options)
              .map((col) => (
                <Select
                  key={String(col.key)}
                  value={filters[col.key] as string}
                  onValueChange={(value) => handleFilterChange(col.key, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={`Filter by ${col.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {col.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleSort(column.key)}
                            >
                              {renderSortIcon(column.key)}
                            </Button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {paginatedData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className="p-4 align-middle"
                        >
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]?.toString() ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Badge variant="outline" className="px-4">
                Page {currentPage} of {totalPages}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
