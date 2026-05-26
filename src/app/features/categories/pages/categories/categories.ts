import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateCategoryModal } from '../../../../shared/components/create-category-modal/create-category-modal';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_PRINCIPAL_HEADER,
  MY_CATEGORIES_FILTERS,
  MY_CATEGORIES_DATA_MOCK,
  CATEGORY_FILTER_ALL,
  CATEGORY_FILTER_INACTIVE,
  CATEGORY_FILTER_DELETE,
  CATEGORY_ROW_ACTIONS,
} from '../../../../core/helpers/constants/categories-constants';
import { Category } from '../../../../core/interfaces/category.interface';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
  STATE_ACTIVE,
  STATE_INACTIVE,
  STATE_DELETED,
} from '../../../../core/helpers/constants/global-constants';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, Filter, Tables, DeleteModal, MainButton, CreateCategoryModal],
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
  selectedCategoryForEdit: Category | null = null;

  private readonly BTN_DELETE_CATEGORY_ID = 'btn-abrir-modal-delete-category';
  private readonly BTN_CREATE_CATEGORY_ID = 'btn-abrir-modal-create-category';

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
  }

  categoriesData: Category[] = [...MY_CATEGORIES_DATA_MOCK];
  tableData: Category[] = [];

  constructor() {
    this.tableData = this.getFilteredData(this.filtroActual);
  }

  abrirCrearCategoria(): void {
    this.selectedCategoryForEdit = null;
    document.getElementById(this.BTN_CREATE_CATEGORY_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }): void {
    const row = evento.row as unknown as Category;
    if (evento.actionId === TABLE_ACTION_CHANGE_STATE) {
      const index = this.categoriesData.findIndex((c) => c.id === row.id);
      if (index !== -1) {
        const current = this.categoriesData[index].estado.toUpperCase();
        if (current.includes('ACTIV') && !current.includes('DESACTIV')) {
          this.categoriesData[index].estado = STATE_INACTIVE;
        } else {
          this.categoriesData[index].estado = STATE_ACTIVE;
        }
        this.tableData = this.getFilteredData(this.filtroActual);
      }
    } else if (evento.actionId === TABLE_ACTION_DELETE) {
      this.categoriaSeleccionadaParaBorrar = row;
      document.getElementById(this.BTN_DELETE_CATEGORY_ID)?.click();
    } else if (evento.actionId === TABLE_ACTION_EDIT_DETAIL) {
      this.selectedCategoryForEdit = row;
      document.getElementById(this.BTN_CREATE_CATEGORY_ID)?.click();
    }
  }

  onSaveCategory(catData: Category): void {
    if (this.selectedCategoryForEdit) {
      const index = this.categoriesData.findIndex((c) => c.id === this.selectedCategoryForEdit!.id);
      if (index !== -1) {
        this.categoriesData[index] = {
          ...this.categoriesData[index],
          ...catData,
        };
      }
    } else {
      const nextId =
        this.categoriesData.length > 0 ? Math.max(...this.categoriesData.map((c) => c.id)) + 1 : 1;
      const newCat: Category = {
        id: nextId,
        nombre: catData.nombre,
        descripcion: catData.descripcion,
        icon: catData.icon || 'bi-paw',
        estado: STATE_ACTIVE,
        acciones: '',
      };
      this.categoriesData.push(newCat);
    }
    this.tableData = this.getFilteredData(this.filtroActual);
    this.selectedCategoryForEdit = null;
  }

  confirmarEliminar(): void {
    if (this.categoriaSeleccionadaParaBorrar) {
      const index = this.categoriesData.findIndex(
        (c) => c.id === this.categoriaSeleccionadaParaBorrar!.id,
      );
      if (index !== -1) {
        this.categoriesData[index].estado = STATE_DELETED;
      }
      this.tableData = this.getFilteredData(this.filtroActual);
      this.categoriaSeleccionadaParaBorrar = null;
    }
  }

  private getFilteredData(filterId: string): Category[] {
    let filtered = this.categoriesData;
    if (filterId === CATEGORY_FILTER_ALL) {
      filtered = this.categoriesData.filter((c) => c.estado !== STATE_DELETED);
    } else if (filterId === CATEGORY_FILTER_INACTIVE) {
      filtered = this.categoriesData.filter((c) => c.estado === STATE_INACTIVE);
    } else if (filterId === CATEGORY_FILTER_DELETE) {
      filtered = this.categoriesData.filter((c) => c.estado === STATE_DELETED);
    }
    return filtered.map((category) => ({ ...category }));
  }
}
