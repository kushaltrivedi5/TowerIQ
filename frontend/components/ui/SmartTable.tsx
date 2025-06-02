import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  options?: { label: string; value: string }[]; // for filterable columns
};

interface SmartTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  pageSize?: number;
}

export function SmartTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  pageSize = 20,
}: SmartTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = React.useState(true);
  const [page, setPage] = React.useState(1);

  // Filtering
  let filtered = data;
  if (searchKey && search) {
    filtered = filtered.filter((row) =>
      String(row[searchKey]).toLowerCase().includes(search.toLowerCase())
    );
  }
  columns.forEach((col) => {
    if (col.filterable && filters[col.key as string]) {
      filtered = filtered.filter(
        (row) => String(row[col.key]) === filters[col.key as string]
      );
    }
  });

  // Sorting
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1); // Reset to first page on filter/search/sort change
  }, [search, filters, sortKey, sortAsc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        {searchKey && (
          <Input
            placeholder={`Search ${String(searchKey)}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48"
          />
        )}
        {columns
          .filter((col) => col.filterable && col.options)
          .map((col) => (
            <Select
              key={String(col.key)}
              value={filters[col.key as string] || ""}
              onValueChange={(val) =>
                setFilters((f) => ({ ...f, [col.key as string]: val }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={`Filter by ${col.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {col.options!.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={col.sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => {
                    if (col.sortable) {
                      if (sortKey === col.key) setSortAsc((a) => !a);
                      else {
                        setSortKey(col.key);
                        setSortAsc(true);
                      }
                    }
                  }}
                >
                  {col.label}
                  {col.sortable &&
                    sortKey === col.key &&
                    (sortAsc ? " ▲" : " ▼")}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? (
              paginated.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
