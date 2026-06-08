export type SearchFilterField = string;
export type SearchSortDirection = 'desc' | 'asc';

export interface SearchFilterOption {
  value: SearchFilterField;
  label: string;
}

export interface SearchFilterValue {
  searchTerm: string;
  searchField: SearchFilterField;
  createdAt: string;
  sortDirection: SearchSortDirection;
}
