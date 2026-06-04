import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DEFAULT_RAFFLE_START_DATE,
  DEFAULT_RAFFLE_END_DATE,
  DEFAULT_RAFFLE_META,
  DEFAULT_RAFFLE_TICKETS_TOTAL,
  DEFAULT_RAFFLE_TICKET_PRICE,
  DEFAULT_RAFFLE_BENEFICIARY_PERCENT,
  DEFAULT_RAFFLE_WINNER_PERCENT,
  DEFAULT_RAFFLE_BLOG_CARD,
  DEFAULT_RAFFLE_BLOG_DETAIL,
  DEFAULT_RAFFLE_TIME_LEFT,
  DEFAULT_RAFFLE_METODO_SORTEO,
} from '../../../../core/helpers/global/raffle.constants';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';
import { STATE_DELETED } from '../../../../core/helpers/global/category.constants';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ImageCropperComponent } from '../../../../shared/components/image-cropper/image-cropper';
import { CategoryService } from '../../../../core/services/api/category.service';
import { FoundationService } from '../../../../core/services/api/foundation.service';
import { Category } from '../../../../core/interfaces/api/category.interface';
import { Foundation } from '../../../../core/interfaces/api/foundation.interface';

@Component({
  selector: 'app-create-raffle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal, ImageCropperComponent],
  templateUrl: './create-raffle-modal.html',
  styleUrl: './create-raffle-modal.scss',
})
export class CreateRaffleModal implements OnChanges, OnInit {
  @Input() raffle: Raffle | null = null;
  @Input() isReadOnly = false;
  @Output() save = new EventEmitter<Raffle>();
  @Output() closed = new EventEmitter<void>();

  private readonly categoryService = inject(CategoryService);
  private readonly foundationService = inject(FoundationService);

  categories: Category[] = [];
  foundations: Foundation[] = [];

  ngOnInit() {
    this.loadDropdownData();
  }

  loadDropdownData() {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.categories = res.data.filter((c) => c.status !== STATE_DELETED);
        }
      },
      error: (err) => {
        console.error('CreateRaffleModal: Error al cargar categorías', err);
      }
    });

    this.foundationService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.foundations = res.data.filter((f) => f.status !== STATE_DELETED);
        }
      },
      error: (err) => {
        console.error('CreateRaffleModal: Error al cargar fundaciones', err);
      }
    });
  }

  title = '';
  foundation = '';
  category = '';
  startDate = '';
  endDate = '';
  goal: number | null = null;
  ticketsAvailable: number | null = null;
  ticketPrice: number | null = null;
  beneficiaryPercentage: number | null = null;
  winnerPercentage: number | null = null;
  blogCardText = '';
  blogDetailText = '';
  photo = '';
  drawMethod: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC';

  activeTab: 'card' | 'detalle' = 'card';
  touchedFields: { [key: string]: boolean } = {};
  isSaving = false;

  formatDateToYYYYMMDD(dateVal: any): string {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      if (dateVal.includes('T')) {
        return dateVal.split('T')[0];
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        return dateVal;
      }
    }
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return '';
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffle']) {
      this.isSaving = false;
      this.resetForm();
    }
  }

  setTab(tab: 'card' | 'detalle') {
    this.activeTab = tab;
  }

  resetForm() {
    this.isSaving = false;
    this.touchedFields = {};
    if (this.raffle) {
      this.title = this.raffle.title || '';
      this.foundation = this.raffle.foundation || '';
      this.category = this.raffle.category || '';
      this.startDate = this.formatDateToYYYYMMDD(this.raffle.startDate);
      this.endDate = this.formatDateToYYYYMMDD(this.raffle.endDate);
      this.goal =
        this.raffle.goal !== undefined && this.raffle.goal !== null
          ? this.raffle.goal
          : DEFAULT_RAFFLE_META;
      this.ticketsAvailable = this.raffle.totalTickets || DEFAULT_RAFFLE_TICKETS_TOTAL;
      this.ticketPrice = this.raffle.ticketPrice || DEFAULT_RAFFLE_TICKET_PRICE;
      this.beneficiaryPercentage =
        this.raffle.beneficiaryPercentage !== undefined &&
        this.raffle.beneficiaryPercentage !== null
          ? this.raffle.beneficiaryPercentage
          : DEFAULT_RAFFLE_BENEFICIARY_PERCENT;
      this.winnerPercentage =
        this.raffle.winnerPercentage !== undefined && this.raffle.winnerPercentage !== null
          ? this.raffle.winnerPercentage
          : DEFAULT_RAFFLE_WINNER_PERCENT;
      this.blogCardText = this.raffle.blogCardText || DEFAULT_RAFFLE_BLOG_CARD;
      this.blogDetailText = this.raffle.blogDetailText || DEFAULT_RAFFLE_BLOG_DETAIL;
      this.photo = this.raffle.photo || '';
      this.drawMethod = this.raffle.drawMethod || DEFAULT_RAFFLE_METODO_SORTEO;
    } else {
      this.title = '';
      this.foundation = '';
      this.category = '';
      this.startDate = '';
      this.endDate = '';
      this.goal = null;
      this.ticketsAvailable = null;
      this.ticketPrice = null;
      this.beneficiaryPercentage = null;
      this.winnerPercentage = null;
      this.blogCardText = '';
      this.blogDetailText = '';
      this.photo = '';
      this.drawMethod = DEFAULT_RAFFLE_METODO_SORTEO;
    }
  }

  onBeneficiaryPercentageChange() {
    if (this.beneficiaryPercentage !== null) {
      if (this.beneficiaryPercentage < 0) this.beneficiaryPercentage = 0;
      if (this.beneficiaryPercentage > 100) this.beneficiaryPercentage = 100;
      this.winnerPercentage = 100 - this.beneficiaryPercentage;
    }
  }

  onWinnerPercentageChange() {
    if (this.winnerPercentage !== null) {
      if (this.winnerPercentage < 0) this.winnerPercentage = 0;
      if (this.winnerPercentage > 100) this.winnerPercentage = 100;
      this.beneficiaryPercentage = 100 - this.winnerPercentage;
    }
  }

  getTodayDate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  autoCalculateTicketPrice() {
    if (
      this.goal !== null &&
      this.goal > 0 &&
      this.ticketsAvailable !== null &&
      this.ticketsAvailable > 0
    ) {
      this.ticketPrice = Math.round((this.goal / this.ticketsAvailable) * 100) / 100;
    }
  }

  isFormValid(): boolean {
    return (
      this.title.trim().length >= 3 &&
      this.title.trim().length <= 100 &&
      this.foundation !== '' &&
      this.category !== '' &&
      this.startDate !== '' &&
      this.endDate !== '' &&
      this.startDate <= this.endDate &&
      this.goal !== null &&
      this.goal > 0 &&
      this.ticketsAvailable !== null &&
      this.ticketsAvailable > 0 &&
      this.ticketPrice !== null &&
      this.ticketPrice > 0 &&
      this.beneficiaryPercentage !== null &&
      this.beneficiaryPercentage >= 0 &&
      this.beneficiaryPercentage <= 100 &&
      this.winnerPercentage !== null &&
      this.winnerPercentage >= 0 &&
      this.winnerPercentage <= 100 &&
      this.photo !== ''
    );
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.raffle) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: any, nuevo: any) => {
      const normAnterior =
        anterior === null || anterior === undefined ? '' : String(anterior).trim();
      const normNuevo = nuevo === null || nuevo === undefined ? '' : String(nuevo).trim();
      if (normAnterior !== normNuevo) {
        this.cambios.push({
          campo,
          anterior: normAnterior || '(Vacío)',
          nuevo: normNuevo || '(Vacío)',
        });
      }
    };

    checkChange('Nombre Rifa', this.raffle.title, this.title);
    checkChange('Fundación', this.raffle.foundation, this.foundation);
    checkChange('Categoría', this.raffle.category, this.category);
    checkChange('Fecha Inicio', this.raffle.startDate, this.startDate);
    checkChange('Fecha Fin', this.raffle.endDate, this.endDate);
    checkChange('Meta Dinero', this.raffle.goal, this.goal);
    checkChange('Método de Sorteo', this.raffle.drawMethod, this.drawMethod);
    checkChange('Número de Boletos', this.raffle.totalTickets, this.ticketsAvailable);
    checkChange('Precio Boleto', this.raffle.ticketPrice, this.ticketPrice);
    checkChange(
      'Porcentaje Beneficiarios',
      this.raffle.beneficiaryPercentage,
      this.beneficiaryPercentage,
    );
    checkChange('Porcentaje Ganadores', this.raffle.winnerPercentage, this.winnerPercentage);
    checkChange('Texto Card', this.raffle.blogCardText, this.blogCardText);
    checkChange('Texto Detalle', this.raffle.blogDetailText, this.blogDetailText);

    if ((this.raffle.photo || '') !== (this.photo || '')) {
      this.cambios.push({
        campo: 'Imagen',
        anterior: this.raffle.photo ? 'Imagen Anterior' : '(Sin Imagen)',
        nuevo: this.photo ? 'Nueva Imagen' : '(Sin Imagen)',
      });
    }

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid()) return;

    if (this.raffle) {
      const hasChanges = this.detectarCambios();
      if (hasChanges) {
        this.showConfirmModal = true;
      } else {
        this.onSubmit();
        document.getElementById('btn-cerrar-modal-crear-rifa')?.click();
      }
    } else {
      this.onSubmit();
      document.getElementById('btn-cerrar-modal-crear-rifa')?.click();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSubmit();
    document.getElementById('btn-cerrar-modal-crear-rifa')?.click();
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSaving) return;
    this.isSaving = true;

    // Temporizador de seguridad de 5 segundos para restablecer isSaving si ocurre un error
    setTimeout(() => {
      this.isSaving = false;
    }, 5000);

    const data: Raffle = {
      _id: this.raffle?._id ?? '',
      status: this.raffle?.status || 'ACTIVE',

      soldTickets: this.raffle?.soldTickets ?? 0,
      collected: this.raffle?.collected ?? 0,
      winner: this.raffle?.winner ?? '',
      remainingTime: this.raffle?.remainingTime ?? DEFAULT_RAFFLE_TIME_LEFT,
      actions: this.raffle?.actions ?? '',
      title: this.title,
      foundation: this.foundation,
      category: this.category,
      startDate: this.startDate,
      endDate: this.endDate,
      goal: this.goal,
      totalTickets: this.ticketsAvailable ?? DEFAULT_RAFFLE_TICKETS_TOTAL,
      ticketPrice: this.ticketPrice ?? DEFAULT_RAFFLE_TICKET_PRICE,
      beneficiaryPercentage: this.beneficiaryPercentage ?? DEFAULT_RAFFLE_BENEFICIARY_PERCENT,
      winnerPercentage: this.winnerPercentage ?? DEFAULT_RAFFLE_WINNER_PERCENT,
      blogCardText: this.blogCardText,
      blogDetailText: this.blogDetailText,
      photo: this.photo,
      tickets: this.raffle?.tickets ?? [],
      drawMethod: this.drawMethod,
    };

    this.save.emit(data);
  }

  onModalClosed() {
    this.resetForm();
    this.closed.emit();
  }
}
