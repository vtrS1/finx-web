export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => string;
  sortable?: boolean;
}

export interface DataTableSort {
  key: string;
  direction: DataTableSortDirection;
}
