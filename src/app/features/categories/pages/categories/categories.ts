import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Filter } from '../../../../shared/components/filter/filter';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateCategoryModal } from '../../components/create-category-modal/create-category-modal';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  CATEGORIES_COLUMNS,
  CATEGORIES_PRINCIPAL_HEADER,
  MY_CATEGORIES_FILTERS,
  CATEGORY_FILTER_ALL,
  CATEGORY_FILTER_INACTIVE,
  CATEGORY_FILTER_DELETE,
  CATEGORY_ROW_ACTIONS,
  STATE_ACTIVE,
  STATE_INACTIVE,
  STATE_DELETED,
} from '../../../../core/helpers/global/category.constants';
import { Category } from '../../../../core/interfaces/api/category.interface';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../../../../core/helpers/ui/constants';
import { CategoryService } from '../../../../core/services/api/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    Filter,
    Tables,
    DeleteModal,
    MainButton,
    CreateCategoryModal,
    ConfirmChangesModal,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  principalHeader = CATEGORIES_PRINCIPAL_HEADER;
  categoriesColumns = CATEGORIES_COLUMNS;
  categoriesFilters = MY_CATEGORIES_FILTERS;
  categoriesActions = CATEGORY_ROW_ACTIONS;

  filtroActual = CATEGORY_FILTER_ALL;
  categoriaSeleccionadaParaBorrar: Category | null = null;
  selectedCategoryForEdit: Category | null = null;
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: Category | null = null;

  private readonly BTN_DELETE_CATEGORY_ID = 'btn-abrir-modal-delete-category';
  private readonly BTN_CREATE_CATEGORY_ID = 'btn-abrir-modal-create-category';

  categoriesData: Category[] = [];
  tableData: Category[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.categoryService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.categoriesData = res.data;
          this.tableData = this.getFilteredData(this.filtroActual);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error: No se pudo cargar categorías del backend.', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrarPorCategoria(id: string): void {
    this.filtroActual = id;
    this.tableData = this.getFilteredData(id);
    this.cdr.detectChanges();
  }

  abrirCrearCategoria(): void {
    this.selectedCategoryForEdit = null;
    this.isReadOnlyView = false;
    document.getElementById(this.BTN_CREATE_CATEGORY_ID)?.click();
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }): void {
    const row = evento.row as unknown as Category;
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_CHANGE_STATE]: () => {
          try {
            const index = this.categoriesData.findIndex((c) => c._id === row._id);
            if (index === -1) throw new Error();
            const current = this.categoriesData[index].status;
            const nextState = current === STATE_ACTIVE ? STATE_INACTIVE : STATE_ACTIVE;

            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado de la Categoría',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch { }
        },
        [TABLE_ACTION_DELETE]: () => {
          this.categoriaSeleccionadaParaBorrar = row;
          document.getElementById(this.BTN_DELETE_CATEGORY_ID)?.click();
        },
        [TABLE_ACTION_EDIT_DETAIL]: () => {
          this.selectedCategoryForEdit = row;
          this.isReadOnlyView = row.status === STATE_DELETED;
          document.getElementById(this.BTN_CREATE_CATEGORY_ID)?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch { }
  }

  onSaveCategory(catData: Category): void {
    const editCategory = this.selectedCategoryForEdit;
    if (editCategory) {
      this.categoryService.update(editCategory._id, catData).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la categoría.', err);
        },
      });
    } else {
      this.categoryService.create(catData).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la categoría.', err);
        },
      });
    }
    this.selectedCategoryForEdit = null;
  }

  confirmarEliminar(razon: string): void {
    const targetCat = this.categoriaSeleccionadaParaBorrar;
    if (!targetCat) return;

    this.categoryService.deleteCategory(targetCat._id, razon).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la categoría del backend.', err);
      },
    });
    this.categoriaSeleccionadaParaBorrar = null;
  }

  confirmarCambioEstado(): void {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0) {
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVE' | 'INACTIVE' | 'DELETED';
      this.categoryService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar el estado de la categoría.', err);
        },
      });
    }
    this.cancelarCambioEstado();
  }

  cancelarCambioEstado(): void {
    this.showConfirmModal = false;
    this.changesToConfirm = [];
    this.pendingRowToToggle = null;
  }

  private getFilteredData(filterId: string): Category[] {
    let filtered = this.categoriesData;
    try {
      const filterActions: Record<string, () => Category[]> = {
        [CATEGORY_FILTER_ALL]: () => this.categoriesData.filter((c) => c.status !== STATE_DELETED),
        [CATEGORY_FILTER_INACTIVE]: () =>
          this.categoriesData.filter((c) => c.status === STATE_INACTIVE),
        [CATEGORY_FILTER_DELETE]: () =>
          this.categoriesData.filter((c) => c.status === STATE_DELETED),
      };

      const filterFn = filterActions[filterId];
      if (!filterFn) throw new Error();
      filtered = filterFn();
    } catch { }
    return filtered.map((category) => ({ ...category }));
  }
}
