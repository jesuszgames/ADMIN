import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_PRINCIPAL_HEADER,
  MY_CATEGORIES_FILTERS,
  MY_CATEGORIES_DATA_MOCK,
  CATEGORY_FILTER_ALL,
  CATEGORY_FILTER_INACTIVE,
  CATEGORY_FILTER_DELETE,
  CATEGORY_ROW_ACTIONS,
  Category,
} from '../../../../core/helpers/constants/categories-constants';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../../../../core/helpers/constants/global-constants';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  principalHeader = CATEGORIES_PRINCIPAL_HEADER;
  categoriesColumns = CATEGORIES_COLUMNS;
  categoriesFilters = MY_CATEGORIES_FILTERS;
  categoriesActions = CATEGORY_ROW_ACTIONS;

  filtroActual = CATEGORY_FILTER_ALL;
  categoriaSeleccionadaParaBorrar: Category | null = null;

  private readonly BTN_DELETE_CATEGORY_ID = 'btn-abrir-modal-delete-category';

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  categoriesData: Category[] = [...MY_CATEGORIES_DATA_MOCK];
  tableData: Category[] = [];

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  manejarAccion(evento: { actionId: number; row: Category }): void {
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.categoriesData.findIndex((c) => c.id === evento.row.id);
      if (index !== -1) {
        const current = this.categoriesData[index].estado.toUpperCase();
        if (current.includes('ACTIV') && !current.includes('DESACTIV')) {
          this.categoriesData[index].estado = 'DESACTIVADO';
        } else {
          this.categoriesData[index].estado = 'ACTIVO';
        }
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === TABLE_ACTION_DELETE) {
      this.categoriaSeleccionadaParaBorrar = evento.row;
      document.getElementById(this.BTN_DELETE_CATEGORY_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_DETAIL) {
      console.log('Editar Categoría:', evento.row);
    }
  }

  confirmarEliminar(): void {
    if (this.categoriaSeleccionadaParaBorrar) {
      const index = this.categoriesData.findIndex(
        (c) => c.id === this.categoriaSeleccionadaParaBorrar!.id
      );
      if (index !== -1) {
        this.categoriesData[index].estado = 'ELIMINADO';
      }
      this.tableData = this.getFilteredData(this.filtroActual);
      this.categoriaSeleccionadaParaBorrar = null;
    }
  }

  private getFilteredData(filterId: string): Category[] {
    let filtered = this.categoriesData;
    if (filterId === CATEGORY_FILTER_ALL) {
      filtered = this.categoriesData.filter((c) => c.estado !== 'ELIMINADO');
    } else if (filterId === CATEGORY_FILTER_INACTIVE) {
      filtered = this.categoriesData.filter((c) => c.estado === 'DESACTIVADO');
    } else if (filterId === CATEGORY_FILTER_DELETE) {
      filtered = this.categoriesData.filter((c) => c.estado === 'ELIMINADO');
    }
    return filtered.map((category) => ({ ...category }));
  }
}
