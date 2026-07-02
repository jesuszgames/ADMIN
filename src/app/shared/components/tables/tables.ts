import { Component, Input, Output, EventEmitter, SimpleChanges, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Pagination } from '../pagination/pagination';
import { Dropdown } from '../dropdown/dropdown';
import { DropdownAction } from '../../../core/interfaces/api/dropdown-action.interface';
import {
  DEFAULT_ROW_ACTIONS,
  BADGE_BASE_CLASS,
  STATUS_CLASSES,
  BADGE_MAP,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
} from '../../../core/helpers/ui/constants';
import { Search } from '../search/search';
import { TableColumn } from '../../../core/interfaces/api/table-column.interface';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent, Pagination, Dropdown, Search],
  templateUrl: './tables.html',
  styleUrl: './tables.scss',
})
export class Tables<T extends Record<string, unknown> = Record<string, unknown>> implements OnInit {
  isMobile = false;

  @Input() showStatusFilter = false;
  @Input() statusOptions: readonly any[] = [];
  @Input() selectedStatus: any = 'all';
  @Output() statusChanged = new EventEmitter<any>();

  onStatusChange(newStatus: any): void {
    this.statusChanged.emit(newStatus);
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
    }
  }
  @Input() principalheader: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() loading: boolean = false;
  @Input() pageSize: number = DEFAULT_PAGE_SIZE;
  @Input() currentPage: number = DEFAULT_CURRENT_PAGE;
  @Input() totalItems: number = 0;
  @Input() serverSide: boolean = false;
  pagedData: T[] = [];

  @Output() actionClicked = new EventEmitter<{ actionId: number; row: T }>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() refreshData = new EventEmitter<void>();

  @Input() rowActions: DropdownAction[] = DEFAULT_ROW_ACTIONS;

  @Input() placeholderSearch: string = 'Buscar...';
  @Input() showSearch: boolean = true;
  @Output() searchChanged = new EventEmitter<string>();
  searchText: string = '';

  onRefreshClick(): void {
    this.refreshData.emit();
  }

  getBadgeClasses(value: unknown): string {
    try {
      if (value === null || value === undefined) {
        throw new Error('Value is empty');
      }
      const valueUpper = String(value).toUpperCase();
      const matchedKey = Object.keys(BADGE_MAP).find((key) => valueUpper.includes(key));
      if (!matchedKey) {
        throw new Error('No matching status class');
      }
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES[BADGE_MAP[matchedKey]]}`;
    } catch {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.DEFAULT}`;
    }
  }

  translateStatus(value: unknown): string {
    if (value === null || value === undefined || String(value).trim() === '') return '—';
    const valStr = String(value).toUpperCase();
    const translations: Record<string, string> = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      FINISHED: 'Finalizado',
      DRAFT: 'Borrador',
      DELETED: 'Eliminado',
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      SUCCESS: 'Éxito',
      AUTOMATIC: 'Automático',
      MANUAL: 'Manual',
      'PENDING-DRAW': 'Pendiente Sorteo',
      'NO TICKETS': 'Sin Boletos',
      'NO-TICKETS': 'Sin Boletos',
      'SOON TO EXPIRE': 'Próximo a Vencer',
      'SOON-TO-EXPIRE': 'Próximo a Vencer',
      'GOAL COMPLETED': 'Meta Alcanzada',
      GOAL: 'Meta Alcanzada',
    };
    return translations[valStr] || String(value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const hasDataChange = !!changes['data'];
    const hasPageSizeChange = !!changes['pageSize'];
    const hasTotalItemsChange = !!changes['totalItems'];
    const hasCurrentPageChange = !!changes['currentPage'];

    if (hasDataChange || hasPageSizeChange || hasTotalItemsChange || hasCurrentPageChange) {
      if (!this.serverSide && hasDataChange) {
        this.currentPage = 1;
      }
      this.updatePagedData();
    }
  }

  updatePagedData(): void {
    try {
      if (this.serverSide) {
        this.pagedData = this.data || [];
      } else {
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
      }
    } catch (err) {
      console.error('Error in updatePagedData:', err);
      this.totalItems = 0;
      this.pagedData = [];
    }
  }
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    if (this.serverSide) {
      this.pageChanged.emit(newPage);
    } else {
      this.updatePagedData();
    }
  }

  onActionSelect(actionId: number, row: T): void {
    this.actionClicked.emit({ actionId, row });
  }

  getRowActions(row: T): DropdownAction[] {
    try {
      const estado = String(row['status'] || '').toUpperCase();

      if (estado === 'DELETED') {
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
      field === 'tiempoRestante' ||
      field === 'fechaSorteo' ||
      field === 'ganadorText'
    );
  }

  handleSearch(searchValue: string) {
    this.searchText = searchValue;
    this.currentPage = 1;
    if (this.serverSide) {
      this.searchChanged.emit(searchValue);
    } else {
      this.updatePagedData();
    }
  }
}
