export function simulateDelay(data, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function paginate(items, page = 1, pageSize = 20) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    meta: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
