export interface PaginatedResult<T> {
  result: T[];
  totalCount: number;
  page?: number;
  totalPages?: number;
}
