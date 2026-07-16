export type StatusFilterId = 'all' | 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface StatusFilterOption {
  id: StatusFilterId;
  label: string;
}
export const STATUS_FILTER_OPTIONS: readonly StatusFilterOption[] = [
  { id: 'all', label: 'Todo' },
  { id: 'ACTIVE', label: 'Activo' },
  { id: 'INACTIVE', label: 'Inactivo' },
  { id: 'DELETED', label: 'Eliminado' },
] as const;

export const STATUS_ALL_EXCEPT_DELETED = 'ALL_ACTIVE_INACTIVE';

export function statusFilterToBackend(filterId: string): string {
  switch (filterId) {
    case 'all':
      return STATUS_ALL_EXCEPT_DELETED;
    case 'ACTIVE':
      return 'ACTIVE';
    case 'INACTIVE':
      return 'INACTIVE';
    case 'DELETED':
      return 'DELETED';
    default:
      return '';
  }
}
