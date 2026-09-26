'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Builds the page number sequence with smart ellipsis.
 * e.g., [1, 2, 3, 4, 5] or [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If near beginning: 1, 2, 3, 4, 5, ..., totalPages
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }

  // If near end: 1, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In middle: 1, ..., currentPage - 1, currentPage, currentPage + 1, ..., totalPages
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const displayStart = totalItems === 0 ? 0 : startIndex + 1;
  const displayEnd = Math.min(endIndex, totalItems);

  return (
    <nav
      aria-label="Domain catalog pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 py-4 px-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md w-full shadow-lg"
    >
      {/* Range summary */}
      <div className="text-xs text-[#6d8196] font-medium flex items-center gap-1.5">
        <span>Showing</span>
        <span className="font-semibold text-white px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/5">
          {displayStart} - {displayEnd}
        </span>
        <span>of</span>
        <span className="font-semibold text-white px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/5">
          {totalItems}
        </span>
        <span>domains</span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/[0.03] text-[#82c8e5] hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-[#6d8196] select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-8 h-8 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#0047ab] text-white border border-[#82c8e5]/40 shadow-[0_0_12px_rgba(130,200,229,0.3)] font-bold'
                    : 'bg-white/[0.03] text-[#6d8196] border border-white/10 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/[0.03] text-[#82c8e5] hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
        >
          <span className="hidden xs:inline">Next</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
