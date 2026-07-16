import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { MainButton } from '../../../../shared/components/main-button/main-button';
import { CreateBannerModal } from '../../components/create-banner-modal/create-banner-modal';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { StatusFilterComponent } from '../../../../shared/components/status-filter/status-filter.component';
import { ModelChange } from '../../../../core/interfaces/api/model-change.interface';
import {
  BANNERS_COLUMNS,
  BANNERS_PRINCIPAL_HEADER,
  BANNER_ROW_ACTIONS,
  STATE_ACTIVE,
  STATE_INACTIVE,
  STATE_DELETED,
} from '../../../../core/helpers/global/banner.constants';
import {
  STATUS_FILTER_OPTIONS,
  statusFilterToBackend,
} from '../../../../core/helpers/global/status-filter.constants';
import { Banner } from '../../../../core/services/api/banner.service';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../../../../core/helpers/ui/constants';
import { BannerService } from '../../../../core/services/api/banner.service';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Tables,
    DeleteModal,
    MainButton,
    CreateBannerModal,
    ConfirmChangesModal,
  ],
  templateUrl: './banners.html',
  styleUrl: './banners.scss',
})
export class Banners implements OnInit {
  private readonly bannerService = inject(BannerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  principalHeader = BANNERS_PRINCIPAL_HEADER;
  bannersColumns = BANNERS_COLUMNS;
  bannersActions = BANNER_ROW_ACTIONS;

  selectedStatus: 'all' | 'ACTIVE' | 'INACTIVE' | 'DELETED' = 'all';
  tempStatus: 'all' | 'ACTIVE' | 'INACTIVE' | 'DELETED' = 'all';

  readonly statusOptions = STATUS_FILTER_OPTIONS;

  bannerSeleccionadoParaBorrar: Banner | null = null;
  selectedBannerForEdit: Banner | null = null;
  isReadOnlyView = false;

  showConfirmModal = false;
  changesToConfirm: ModelChange[] = [];
  pendingRowToToggle: Banner | null = null;

  showDeleteModal = false;
  showCreateModal = false;

  private readonly BTN_DELETE_BANNER_ID = 'btn-abrir-modal-delete-banner';
  private readonly BTN_CREATE_BANNER_ID = 'btn-abrir-modal-create-banner';

  bannersData: Banner[] = [];
  tableData: Banner[] = [];
  loading: boolean = true;
  isBannerSaving = false;
  isBannerDeleting = false;
  isBannerUpdatingState = false;

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchTerm = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    setTimeout(() => {
      this.loadBanners();
    });
  }

  loadBanners(): void {
    this.loading = true;
    this.cdr.detectChanges();
    const statusParam = statusFilterToBackend(this.selectedStatus);
    this.bannerService
      .getAll(this.currentPage, this.pageSize, this.searchTerm, statusParam)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.bannersData = (res.data?.result || []).map((b: Banner) => ({
              ...b,
              raffleName: b.raffleId ? b.raffleId.title : '-',
              linkUrl: b.linkUrl ? b.linkUrl : '-'
            }));
            this.tableData = this.bannersData;
            this.totalCount = res.data?.totalCount || 0;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error: No se pudo cargar banners del backend.', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  clearFilters(): void {
    this.selectedStatus = 'all';
    this.applyFilters('all');
  }

  applyFilters(value: 'all' | 'ACTIVE' | 'INACTIVE' | 'DELETED'): void {
    this.selectedStatus = value;
    this.currentPage = 1;
    this.loadBanners();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadBanners();
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadBanners();
  }

  abrirCrearBanner(): void {
    this.selectedBannerForEdit = null;
    this.isReadOnlyView = false;
    this.showCreateModal = true;
    this.cdr.detectChanges();
    document.getElementById(this.BTN_CREATE_BANNER_ID)?.click();
  }

  onCloseCreateBanner(): void {
    this.showCreateModal = false;
    this.selectedBannerForEdit = null;
  }

  onCloseDeleteModal(): void {
    this.showDeleteModal = false;
    this.bannerSeleccionadoParaBorrar = null;
  }

  manejarAccion(evento: { actionId: number; row: Record<string, unknown> }): void {
    const row = evento.row as unknown as Banner;
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_CHANGE_STATE]: () => {
          try {
            const index = this.bannersData.findIndex((c) => c._id === row._id);
            if (index === -1) throw new Error();
            const current = this.bannersData[index].status;
            const nextState = current === STATE_ACTIVE ? STATE_INACTIVE : STATE_ACTIVE;

            this.pendingRowToToggle = row;
            this.changesToConfirm = [
              {
                campo: 'Estado del Banner',
                anterior: current,
                nuevo: nextState,
              },
            ];
            this.showConfirmModal = true;
          } catch {}
        },
        [TABLE_ACTION_DELETE]: () => {
          this.bannerSeleccionadoParaBorrar = row;
          this.showDeleteModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_DELETE_BANNER_ID)?.click();
        },
        [TABLE_ACTION_EDIT_DETAIL]: () => {
          this.selectedBannerForEdit = row;
          this.isReadOnlyView = row.status === STATE_DELETED;
          this.showCreateModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_CREATE_BANNER_ID)?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch {}
  }

  onSaveBanner(formData: FormData): void {
    if (this.isBannerSaving) return;
    this.isBannerSaving = true;

    const editBanner = this.selectedBannerForEdit;
    if (editBanner) {
      this.bannerService
        .update(editBanner._id, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isBannerSaving = false;
            this.loadBanners();
            document.getElementById('btn-cerrar-modal-crear-banner')?.click();
          },
          error: (err) => {
            console.error('API Error: No se pudo actualizar el banner.', err);
            this.isBannerSaving = false;
          },
        });
    } else {
      this.bannerService
        .create(formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isBannerSaving = false;
            this.loadBanners();
            document.getElementById('btn-cerrar-modal-crear-banner')?.click();
          },
          error: (err) => {
            console.error('API Error: No se pudo crear el banner.', err);
            this.isBannerSaving = false;
          },
        });
    }
  }

  confirmarEliminar(razon: string): void {
    const targetBanner = this.bannerSeleccionadoParaBorrar;
    if (!targetBanner || this.isBannerDeleting) return;
    this.isBannerDeleting = true;

    this.bannerService
      .delete(targetBanner._id, razon)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadBanners();
          this.isBannerDeleting = false;
        },
        error: (err) => {
          console.error('API Error: No se pudo eliminar el banner del backend.', err);
          this.isBannerDeleting = false;
        },
      });
    this.bannerSeleccionadoParaBorrar = null;
  }

  confirmarCambioEstado(): void {
    if (
      this.pendingRowToToggle &&
      this.changesToConfirm.length > 0 &&
      !this.isBannerUpdatingState
    ) {
      const nextStatus = this.changesToConfirm[0].nuevo as 'ACTIVE' | 'INACTIVE' | 'DELETED';
      this.isBannerUpdatingState = true;
      const formData = new FormData();
      formData.append('status', nextStatus);
      this.bannerService
        .update(this.pendingRowToToggle._id, formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadBanners();
            this.isBannerUpdatingState = false;
          },
          error: (err) => {
            console.error('API Error: No se pudo actualizar el estado del banner.', err);
            this.isBannerUpdatingState = false;
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
