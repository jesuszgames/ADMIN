import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pagination } from '../pagination/pagination';
import { Dropdown, DropdownAction } from '../dropdown/dropdown';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'actions';
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, Pagination, Dropdown],
  templateUrl: './tables.html',
  styleUrl: './tables.scss',
})
export class Tables {
  @Input() principalheader: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: { [key: string]: unknown }[] = [];
  @Input() pageSize: number = 4;
  @Input() currentPage: number = 1;
  totalItems: number = 0;
  pagedData: { [key: string]: unknown }[] = [];

  @Output() actionClicked = new EventEmitter<{ actionId: number; row: any }>();

  @Input() rowActions: DropdownAction[] = [
    { id: 1, label: 'Ver detalle rifa' },
    { id: 2, label: 'Ver detalles de boletos' },
    { id: 3, label: 'Eliminar' },
  ];

  getBadgeClasses(value: unknown): string {
    const base = 'badge px-3 py-2 text-uppercase font-monospace';
    if (value === null || value === undefined) {
      return `${base} bg-primary bg-opacity-25 text-primary border border-primary border-opacity-20`;
    }
    const v = String(value).toUpperCase();
    if (v.includes('INACT')) {
      return `${base} bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-20`;
    }
    if (v.includes('ACTIV')) {
      return `${base} bg-success bg-opacity-25 text-success border border-success border-opacity-20`;
    }
    if (v.includes('FINALIZ')) {
      return `${base} bg-info bg-opacity-25 text-info border border-info border-opacity-20`;
    }
    if (v.includes('ELIMIN') || v.includes('CANCE')) {
      return `${base} bg-danger bg-opacity-25 text-danger border border-danger border-opacity-20`;
    }
    if (v.includes('SIN') || v.includes('PEND')) {
      return `${base} bg-warning bg-opacity-25 text-warning border border-warning border-opacity-20`;
    }

    return `${base} bg-primary bg-opacity-25 text-primary border border-primary border-opacity-20`;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['pageSize']) {
      this.totalItems = this.data ? this.data.length : 0;
      this.currentPage = 1;
      this.updatePagedData();
    }
  }
  updatePagedData(): void {
    if (!this.data) return;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.data.slice(startIndex, endIndex);
  }
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.updatePagedData();
  }

  onActionSelect(actionId: number, row: any): void {
    this.actionClicked.emit({ actionId, row });
  }
}
