import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
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
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-create-raffle-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmChangesModal,
    ImageCropperComponent,
    NgSelectComponent,
    NgOptionComponent,
  ],
  templateUrl: './create-raffle-modal.html',
  styleUrl: './create-raffle-modal.scss',
})
export class CreateRaffleModal implements OnChanges, OnInit, AfterViewInit {
  @Input() raffle: Raffle | null = null;
  @Input() isReadOnly = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<Raffle>();
  @Output() closed = new EventEmitter<void>();

  private readonly categoryService = inject(CategoryService);
  private readonly foundationService = inject(FoundationService);

  // Categories Pagination & Search State
  categories: Category[] = [];
  categoriesPage = 1;
  categoriesLimit = 20;
  categoriesTotal = 0;
  categoriesLoading = false;
  categoriesSearchTerm = '';
  categoryInput$ = new Subject<string>();

  // Foundations Pagination & Search State
  foundations: Foundation[] = [];
  foundationsPage = 1;
  foundationsLimit = 20;
  foundationsTotal = 0;
  foundationsLoading = false;
  foundationsSearchTerm = '';
  foundationInput$ = new Subject<string>();

  ngOnInit() {
    this.initSearchSubjects();
    this.triggerInitialDropdownLoad();
  }

  initSearchSubjects() {
    this.categoryInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term) => {
          this.categoriesSearchTerm = term || '';
        }),
        switchMap((term) => this.loadCategories(term || '')),
      )
      .subscribe();

    this.foundationInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term) => {
          this.foundationsSearchTerm = term || '';
        }),
        switchMap((term) => this.loadFoundations(term || '')),
      )
      .subscribe();
  }

  triggerInitialDropdownLoad() {
    this.categoriesSearchTerm = '';
    this.foundationsSearchTerm = '';
    this.loadCategories().subscribe();
    this.loadFoundations().subscribe();
  }

  loadCategories(search = '', append = false) {
    this.categoriesLoading = true;
    if (!append) {
      this.categoriesPage = 1;
    }
    return this.categoryService.getAll(this.categoriesPage, this.categoriesLimit, search).pipe(
      tap((res) => {
        this.categoriesLoading = false;
        if (res && res.data) {
          const filtered = res.data.filter((c) => {
            if (c.status === STATE_DELETED) return false;
            if (!this.raffle) {
              return c.status === 'ACTIVE';
            }
            return c.status === 'ACTIVE' || c.name === this.raffle.category;
          });

          if (append) {
            const existingNames = new Set(this.categories.map((c) => c.name));
            const uniqueNew = filtered.filter((c) => !existingNames.has(c.name));
            this.categories = [...this.categories, ...uniqueNew];
          } else {
            this.categories = filtered;
          }
          this.categoriesTotal = res.totalCount || 0;

          if (this.raffle && this.raffle.category) {
            const hasCurrent = this.categories.some((c) => c.name === this.raffle!.category);
            if (!hasCurrent && !search) {
              this.categories.push({
                _id: 'temp_cat',
                name: this.raffle.category,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Category);
            }
          }
        }
      }),
    );
  }

  loadNextCategories() {
    if (this.categoriesLoading || this.categories.length >= this.categoriesTotal) {
      return;
    }
    this.categoriesPage++;
    this.loadCategories(this.categoriesSearchTerm, true).subscribe();
  }

  loadFoundations(search = '', append = false) {
    this.foundationsLoading = true;
    if (!append) {
      this.foundationsPage = 1;
    }
    return this.foundationService.getAll(this.foundationsPage, this.foundationsLimit, search).pipe(
      tap((res) => {
        this.foundationsLoading = false;
        if (res && res.data) {
          const filtered = res.data.filter((f) => {
            if (f.status === STATE_DELETED) return false;
            if (!this.raffle) {
              return f.status === 'ACTIVE';
            }
            return f.status === 'ACTIVE' || f.name === this.raffle.foundation;
          });

          if (append) {
            const existingNames = new Set(this.foundations.map((f) => f.name));
            const uniqueNew = filtered.filter((f) => !existingNames.has(f.name));
            this.foundations = [...this.foundations, ...uniqueNew];
          } else {
            this.foundations = filtered;
          }
          this.foundationsTotal = res.totalCount || 0;

          if (this.raffle && this.raffle.foundation) {
            const hasCurrent = this.foundations.some((f) => f.name === this.raffle!.foundation);
            if (!hasCurrent && !search) {
              this.foundations.push({
                _id: 'temp_found',
                name: this.raffle.foundation,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Foundation);
            }
          }
        }
      }),
    );
  }

  loadNextFoundations() {
    if (this.foundationsLoading || this.foundations.length >= this.foundationsTotal) {
      return;
    }
    this.foundationsPage++;
    this.loadFoundations(this.foundationsSearchTerm, true).subscribe();
  }

  @ViewChild('startDateInput') startDateInput!: ElementRef;
  @ViewChild('endDateInput') endDateInput!: ElementRef;

  startDatePicker?: flatpickr.Instance;
  endDatePicker?: flatpickr.Instance;

  title = '';
  foundation: string | null = null;
  category: string | null = null;
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
  banner = '';
  link = '';
  drawMethod: 'AUTOMATIC' | 'MANUAL' = 'AUTOMATIC';

  activeTab: 'card' | 'detalle' = 'card';
  touchedFields: { [key: string]: boolean } = {};

  ngAfterViewInit() {
    this.initFlatpickr();
  }

  initFlatpickr() {
    if (this.startDateInput && this.startDateInput.nativeElement) {
      this.startDatePicker = flatpickr(this.startDateInput.nativeElement, {
        locale: Spanish,
        dateFormat: 'Y-m-d',
        disableMobile: true,
        allowInput: false,
        clickOpens: !this.isReadOnly,
        defaultDate: this.startDate,
        minDate: this.getMinStartDate(),
        onChange: (selectedDates, dateStr) => {
          this.startDate = dateStr;
          this.touchedFields['startDate'] = true;
          if (this.endDatePicker) {
            this.endDatePicker.set('minDate', dateStr || this.getTodayDate());
          }
        },
        onClose: () => {
          this.touchedFields['startDate'] = true;
        },
      });
    }

    if (this.endDateInput && this.endDateInput.nativeElement) {
      this.endDatePicker = flatpickr(this.endDateInput.nativeElement, {
        locale: Spanish,
        dateFormat: 'Y-m-d',
        disableMobile: true,
        allowInput: false,
        clickOpens: !this.isReadOnly,
        defaultDate: this.endDate,
        minDate: this.startDate || this.getTodayDate(),
        onChange: (selectedDates, dateStr) => {
          this.endDate = dateStr;
          this.touchedFields['endDate'] = true;
          if (this.startDatePicker) {
            // No strict rule for start date max unless needed
          }
        },
        onClose: () => {
          this.touchedFields['endDate'] = true;
        },
      });
    }
  }

  formatDateToYYYYMMDD(dateVal: Date | string | number | null | undefined): string {
    if (!dateVal) return '';
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return '';
      const offsetDate = new Date(date.getTime() - 5 * 60 * 60 * 1000);
      const year = offsetDate.getUTCFullYear();
      const month = String(offsetDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(offsetDate.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['raffle']) {
      this.resetForm();
    }
  }

  setTab(tab: 'card' | 'detalle') {
    this.activeTab = tab;
  }

  resetForm() {
    this.touchedFields = {};
    if (this.raffle) {
      this.title = this.raffle.title || '';
      this.foundation = this.raffle.foundation || null;
      this.category = this.raffle.category || null;
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
      this.banner = this.raffle.banner || '';
      this.link = this.raffle.link || '';
      this.drawMethod = this.raffle.drawMethod || DEFAULT_RAFFLE_METODO_SORTEO;
    } else {
      this.title = '';
      this.foundation = null;
      this.category = null;
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
      this.banner = '';
      this.link = '';
      this.drawMethod = DEFAULT_RAFFLE_METODO_SORTEO;
    }

    if (this.startDatePicker) {
      this.startDatePicker.setDate(this.startDate);
      this.startDatePicker.set('minDate', this.getMinStartDate());
    }
    if (this.endDatePicker) {
      this.endDatePicker.setDate(this.endDate);
      this.endDatePicker.set('minDate', this.startDate || this.getTodayDate());
    }

    this.triggerInitialDropdownLoad();
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
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = String(todayDate.getMonth() + 1).padStart(2, '0');
    const day = String(todayDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMinStartDate(): string {
    if (!this.raffle) {
      return this.getTodayDate();
    }
    const originalStart = this.formatDateToYYYYMMDD(this.raffle.startDate);
    const today = this.getTodayDate();
    if (originalStart && originalStart < today) {
      return originalStart;
    }
    return today;
  }

  get minimumTicketPrice(): number {
    if (this.goal && this.goal > 0 && this.ticketsAvailable && this.ticketsAvailable > 0) {
      return Math.ceil((this.goal / this.ticketsAvailable) * 100) / 100;
    }

    return 0;
  }

  autoCalculateTicketPrice() {
    if (
      this.goal !== null &&
      this.goal > 0 &&
      this.ticketsAvailable !== null &&
      this.ticketsAvailable > 0
    ) {
      this.ticketPrice = Math.ceil((this.goal / this.ticketsAvailable) * 100) / 100;
    }
  }

  preventInvalidNumbers(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      '.',
      ',',
    ];
    if (
      allowedKeys.includes(event.key) ||
      ((event.ctrlKey === true || event.metaKey === true) &&
        ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  preventDecimalsAndSigns(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];
    if (
      allowedKeys.includes(event.key) ||
      ((event.ctrlKey === true || event.metaKey === true) &&
        ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  isFormValid(): boolean {
    if (this.raffle && this.raffle.soldTickets > 0) {
      if (this.ticketsAvailable !== null && this.ticketsAvailable < this.raffle.soldTickets) {
        return false;
      }
      if (this.ticketPrice !== null && this.ticketPrice !== this.raffle.ticketPrice) {
        return false;
      }
    }
    const minStart = this.getMinStartDate();
    if (this.startDate && this.startDate < minStart) {
      return false;
    }
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
      this.ticketPrice >= this.minimumTicketPrice &&
      this.beneficiaryPercentage !== null &&
      this.beneficiaryPercentage >= 0 &&
      this.beneficiaryPercentage <= 100 &&
      this.winnerPercentage !== null &&
      this.winnerPercentage >= 0 &&
      this.winnerPercentage <= 100 &&
      this.photo !== '' &&
      this.banner !== '' &&
      this.blogCardText.trim() !== '' &&
      this.blogDetailText.trim() !== ''
    );
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.raffle) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: unknown, nuevo: unknown) => {
      let normAnterior = anterior === null || anterior === undefined ? '' : String(anterior).trim();
      let normNuevo = nuevo === null || nuevo === undefined ? '' : String(nuevo).trim();

      if (campo === 'Fecha Inicio' || campo === 'Fecha Fin') {
        normAnterior = this.formatDateToYYYYMMDD(normAnterior);
        normNuevo = this.formatDateToYYYYMMDD(normNuevo);
      }

      const translateVal = (val: string) => {
        if (val === 'AUTOMATIC') return 'Automático (Sistema)';
        if (val === 'MANUAL') return 'Manual (En vivo)';
        if (val === 'ACTIVE') return 'Activo';
        if (val === 'INACTIVE') return 'Inactivo';
        if (val === 'DELETED') return 'Eliminado';
        if (val === 'FINISHED') return 'Finalizado';
        return val;
      };

      normAnterior = translateVal(normAnterior);
      normNuevo = translateVal(normNuevo);

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
    checkChange('Link / URL', this.raffle.link, this.link);

    if ((this.raffle.photo || '') !== (this.photo || '')) {
      this.cambios.push({
        campo: 'Imagen Card',
        anterior: this.raffle.photo ? 'Imagen Anterior' : '(Sin Imagen)',
        nuevo: this.photo ? 'Nueva Imagen' : '(Sin Imagen)',
      });
    }

    if ((this.raffle.banner || '') !== (this.banner || '')) {
      this.cambios.push({
        campo: 'Imagen Banner',
        anterior: this.raffle.banner ? 'Imagen Anterior' : '(Sin Imagen)',
        nuevo: this.banner ? 'Nueva Imagen' : '(Sin Imagen)',
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
      }
    } else {
      this.onSubmit();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSubmit();
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSaving) return;

    const data: Raffle = {
      _id: this.raffle?._id ?? '',
      status: this.raffle?.status || 'ACTIVE',

      soldTickets: this.raffle?.soldTickets ?? 0,
      collected: this.raffle?.collected ?? 0,
      winner: this.raffle?.winner ?? '',
      remainingTime: this.raffle?.remainingTime ?? DEFAULT_RAFFLE_TIME_LEFT,
      actions: this.raffle?.actions ?? '',
      title: this.title,
      foundation: this.foundation ?? '',
      category: this.category ?? '',
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
      banner: this.banner,
      link: this.link,
      tickets: this.raffle?.tickets ?? [],
      drawMethod: this.drawMethod,
    };

    this.save.emit(data);
  }

  closePickers() {
    if (this.startDatePicker && this.startDatePicker.isOpen) {
      this.startDatePicker.close();
    }
    if (this.endDatePicker && this.endDatePicker.isOpen) {
      this.endDatePicker.close();
    }
  }

  onModalClosed() {
    this.closePickers();
    this.resetForm();
    this.closed.emit();
  }
}
