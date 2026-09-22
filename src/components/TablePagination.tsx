import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const usePaginatedRows = <T,>(items: T[], pageSize = 10) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const paginatedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return { page, setPage, totalPages, pageSize, paginatedItems };
};

export const TablePagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) => {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <span className="font-semibold text-slate-500">
        {start}-{end} of {totalItems} | Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
