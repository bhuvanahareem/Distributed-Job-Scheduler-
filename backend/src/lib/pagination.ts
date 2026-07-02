export function paginate(pageParam?: string | number, pageSizeParam?: string | number) {
  const page = Math.max(1, parseInt(String(pageParam || 1), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(pageSizeParam || 20), 10) || 20));
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  return { skip, take, page, pageSize };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
