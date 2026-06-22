/**
 * Shared status filter constants & helper used by the four entity pages
 * (categories, foundations, players, staff). Centralizing these removes the
 * duplicated `statusOptions` arrays and the inconsistent backend status
 * translation logic that previously lived in each page component.
 *
 * The backend's `BaseService.getAll` recognises the magic literal
 * `'ALL_ACTIVE_INACTIVE'` and translates it to `{ status: { $ne: DELETED } }`
 * (see `services/base.service.js`). Any other value is sent verbatim and
 * used as the `status` field value. For the user-facing "all" filter we
 * therefore return the magic literal, while specific statuses are passed
 * through unchanged.
 */

export type StatusFilterId = 'all' | 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface StatusFilterOption {
  /** Internal id used both in the UI ngModel and as the key for `statusFilterToBackend`. */
  id: StatusFilterId;
  /** Human-readable label shown in the ng-select dropdown. */
  label: string;
}

/** Canonical status options shared by every entity list page. */
export const STATUS_FILTER_OPTIONS: readonly StatusFilterOption[] = [
  { id: 'all', label: 'Todo' },
  { id: 'ACTIVE', label: 'Activo' },
  { id: 'INACTIVE', label: 'Inactivo' },
  { id: 'DELETED', label: 'Eliminado' },
] as const;

/** Magic literal consumed by `BaseService.getAll` to mean "all except DELETED". */
export const STATUS_ALL_EXCEPT_DELETED = 'ALL_ACTIVE_INACTIVE';

/**
 * Maps the UI filter id to the value the backend expects.
 *
 * The "all" id maps to the magic literal the backend recognises to
 * exclude deleted records. Specific statuses are passed through unchanged.
 * An empty string is returned only for an unknown id, which the callers
 * should treat as "no filter".
 */
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