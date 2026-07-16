import { useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  function goToPage(nextPage, totalPages) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages || nextPage);
    setPage(clamped);
  }

  return { page, pageSize, setPage, setPageSize, goToPage };
}
