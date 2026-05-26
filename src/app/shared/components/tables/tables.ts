import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { Dropdown, DropdownAction } from '../dropdown/dropdown';
import {
  DEFAULT_ROW_ACTIONS,
  BADGE_BASE_CLASS,
  STATUS_CLASSES,
} from '../../../core/helpers/constants/global-constants';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_CURRENT_PAGE,
} from '../../../core/helpers/constants/tables-constants';
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
    if (value === null || value === undefined) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.DEFAULT}`;
    }
    const v = String(value).toUpperCase();
    if (v.includes('INACT') || v.includes('DESACTIV')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.INACTIVE}`;
    }
    if (v.includes('ACTIV')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.ACTIVE}`;
    }
    if (v.includes('PROX')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.PROX_EXPIRED}`;
    }
    if (v.includes('META')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.META_COMPLETED}`;
    }
    if (v.includes('FINALIZ')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.FINALIZED}`;
    }
    if (v.includes('ELIMIN') || v.includes('CANCE')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.CANCELLED}`;
    }
    if (v.includes('SIN') || v.includes('PEND')) {
      return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.NO_TICKETS}`;
    }

    return `${BADGE_BASE_CLASS} ${STATUS_CLASSES.DEFAULT}`;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.currentPage = 1;
      this.updatePagedData();
    }
  }
  updatePagedData(): void {
    if (!this.data) return;

    let filtered = this.data;
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase().trim();
      filtered = this.data.filter((row) => {
        return this.columns.some((col) => {
          const val = row[col.field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      });
    }

    this.totalItems = filtered.length;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = filtered.slice(startIndex, endIndex);
  }
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagedData();
  }

  onActionSelect(actionId: number, row: T): void {
    this.actionClicked.emit({ actionId, row });
  }
  handleSearch(searchValue: string) {
    this.searchText = searchValue;
    this.currentPage = 1;
    this.updatePagedData();
    this.searchChanged.emit(searchValue);
  }
}
