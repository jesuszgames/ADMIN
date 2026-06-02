import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { Dropdown, DropdownAction } from '../dropdown/dropdown';
import {
  DEFAULT_ROW_ACTIONS,
  BADGE_BASE_CLASS,
  STATUS_CLASSES,
  BADGE_MAP,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
} from '../../../core/helpers/ui/constants';
import { Search } from '../search/search';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'actions' | 'icon-text';
  iconField?: string;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, Pagination, Dropdown, Search],
  templateUrl: './tables.html',
  styleUrl: './tables.scss',
})
export class Tables<T extends Record<string, unknown> = Record<string, unknown>> {
  @Input() principalheader: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() loading: boolean = false;
  @Input() pageSize: number = DEFAULT_PAGE_SIZE;
  @Input() currentPage: number = DEFAULT_CURRENT_PAGE;
  totalItems: number = 0;
  pagedData: T[] = [];

  @Output() actionClicked = new EventEmitter<{ actionId: number; row: T }>();

  @Input() rowActions: DropdownAction[] = DEFAULT_ROW_ACTIONS;

  @Input() placeholderSearch: string = 'Buscar...';
  @Output() searchChanged = new EventEmitter<string>();
  searchText: string = '';

  getBadgeClasses(value: unknown): string {
    try {
      if (value === null || value === undefined) {
        throw new Error('Value is empty');
      }
      const v = String(value).toUpperCase();
      const matchedKey = Object.keys(BADGE_MAP).find((key) => v.includes(key));
      if (!matchedKey) {
        throw new Error('No matching status class');
      }
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES[BADGE_MAP[matchedKey]]}`;
    } catch {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.DEFAULT}`;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      const shouldUpdate = changes['data'] || changes['pageSize'];
      if (!shouldUpdate) throw new Error();
      this.currentPage = 1;
      this.updatePagedData();
    } catch {}
  }

  updatePagedData(): void {
    try {
      const query = this.searchText.trim().toLowerCase();
      const filtered = this.data.filter(
        (row) =>
          !query ||
          this.columns.some((col) => {
            try {
              const val = row[col.field];
              if (val === null || val === undefined) throw new Error();
              return String(val).toLowerCase().includes(query);
            } catch {
              return false;
            }
          }),
      );
      this.totalItems = filtered.length;
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.pagedData = filtered.slice(startIndex, endIndex);
    } catch {
      this.totalItems = 0;
      this.pagedData = [];
    }
  }
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagedData();
  }

  onActionSelect(actionId: number, row: T): void {
    this.actionClicked.emit({ actionId, row });
  }

  getRowActions(row: T): DropdownAction[] {
    try {
      const estado = String(row['status'] || row['estado'] || '').toUpperCase();
      if (estado === 'ELIMINADO' || estado === 'DELETED') {
        const filtered: DropdownAction[] = [];
        for (const action of this.rowActions) {
          const label = action.label.toLowerCase();
          if (label.includes('editar')) {
            filtered.push({
              id: action.id,
              label: 'Visualizar Detalle',
              icon: 'bi-eye',
            });
          } else if (
            !label.includes('cambiar') &&
            !label.includes('eliminar') &&
            !label.includes('edit')
          ) {
            filtered.push(action);
          }
        }
        return filtered;
      }
    } catch {}
    return this.rowActions;
  }
  isCenteredColumn(field: string, type?: string): boolean {
    return (
      type === 'actions' ||
      field === 'soldTicketsStr' ||
      field === 'boletosVendidosStr' ||
      field === 'collectedStr' ||
      field === 'recaudadoStr' ||
      field === 'winner' ||
      field === 'ganador' ||
      field === 'remainingTime' ||
      field === 'tiempoRestante'
    );
  }

  handleSearch(searchValue: string) {
    this.searchText = searchValue;
    this.currentPage = 1;
    this.updatePagedData();
    this.searchChanged.emit(searchValue);
  }
}
