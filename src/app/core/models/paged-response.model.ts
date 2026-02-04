export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
