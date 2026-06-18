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
import { isDeletedStatus, isInactiveStatus } from '../../../../core/helpers/ui/utils';

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
  isCategorySaving = false;
  isCategoryDeleting = false;
  isCategoryUpdatingState = false;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchTerm = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  getBackendStatus(filterId: string): string {
    if (filterId === CATEGORY_FILTER_ALL) return 'ALL_ACTIVE_INACTIVE';
    if (filterId === CATEGORY_FILTER_INACTIVE) return 'INACTIVE';
    if (filterId === CATEGORY_FILTER_DELETE) return 'DELETED';
    return '';
  }

  loadCategories(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const statusParam = this.getBackendStatus(this.filtroActual);
    this.categoryService.getAll(this.currentPage, this.pageSize, this.searchTerm, statusParam).subscribe({
      next: (res) => {
        if (res) {
          this.categoriesData = res.data || [];
          this.tableData = this.categoriesData;
          this.totalCount = res.totalCount || 0;
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
    this.currentPage = 1;
    this.loadCategories();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadCategories();
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadCategories();
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
    if (this.isCategorySaving) return;
    this.isCategorySaving = true;

    const editCategory = this.selectedCategoryForEdit;
    if (editCategory) {
      this.categoryService.update(editCategory._id, catData).subscribe({
        next: () => {
          this.loadCategories();
          this.isCategorySaving = false;
          document.getElementById('btn-cerrar-modal-crear-categoria')?.click();
          this.selectedCategoryForEdit = null;
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar la categoría.', err);
          this.isCategorySaving = false;
        },
      });
    } else {
      this.categoryService.create(catData).subscribe({
        next: () => {
          this.loadCategories();
          this.isCategorySaving = false;
          document.getElementById('btn-cerrar-modal-crear-categoria')?.click();
          this.selectedCategoryForEdit = null;
        },
        error: (err) => {
          console.error('API Error: No se pudo crear la categoría.', err);
          this.isCategorySaving = false;
        },
      });
    }
  }

  confirmarEliminar(razon: string): void {
    const targetCat = this.categoriaSeleccionadaParaBorrar;
    if (!targetCat || this.isCategoryDeleting) return;
    this.isCategoryDeleting = true;

    this.categoryService.deleteCategory(targetCat._id, razon).subscribe({
      next: () => {
        this.loadCategories();
        this.isCategoryDeleting = false;
      },
      error: (err) => {
        console.error('API Error: No se pudo eliminar la categoría del backend.', err);
        this.isCategoryDeleting = false;
      },
    });
    this.categoriaSeleccionadaParaBorrar = null;
  }

  confirmarCambioEstado(): void {
    if (this.pendingRowToToggle && this.changesToConfirm.length > 0 && !this.isCategoryUpdatingState) {
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVE' | 'INACTIVE' | 'DELETED';
      this.isCategoryUpdatingState = true;
      this.categoryService.update(this.pendingRowToToggle._id, { status: nextStatus }).subscribe({
        next: () => {
          this.loadCategories();
          this.isCategoryUpdatingState = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo actualizar el estado de la categoría.', err);
          this.isCategoryUpdatingState = false;
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
}


