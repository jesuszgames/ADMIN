import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef, AfterViewInit, OnDestroy, ElementRef, ViewChild, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/ui/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { SimpleCard } from '../../components/simple-card/simple-card';
import { Tables } from '../../../../shared/components/tables/tables';
import { DeleteModal } from '../../../../shared/components/delete-modal/delete-modal';
import { HistoryRafflesModal } from '../../../../shared/components/history-raffles-modal/history-raffles-modal';
import { HistoryTicketModel } from '../../../../shared/components/history-ticket-model/history-ticket-model';
import { RaffleDetail } from '../../../../core/interfaces/api/raffle-detail.interface';
import { TicketHistoryData } from '../../../../core/interfaces/api/ticket-history-data.interface';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { CategoryService } from '../../../../core/services/api/category.service';
import { FoundationService } from '../../../../core/services/api/foundation.service';
import { TicketService } from '../../../../core/services/api/ticket.service';
import { AuthService } from '../../../../core/services/api/auth.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Chart } from 'chart.js/auto';
import {
  mapRaffleDetails,
  mapTicketDetails,
  mapRaffleForTable,
  isDeletedStatus,
} from '../../../../core/helpers/ui/utils';
import {
  DEFAULT_USER_NAME,
  DASHBOARD_PRINCIPAL_HEADER,
  DASHBOARD_COLUMNS,
  PERSO_PAGE_SIZE,
  HISTORY_ROW_ACTIONS,
  DASHBOARD_CHART_PALETTE,
  DASHBOARD_CHART_TREND_COLOR,
  DASHBOARD_CHART_BAR_COLOR,
  DASHBOARD_CHART_BAR_HOVER,
  DARK_AXIS_TICKS,
  DARK_AXIS_GRID,
  DARK_LEGEND,
  DOUGHNUT_TOP_N,
} from '../../../../core/helpers/global/dashboard.constants';
import { UnlinkLogs } from '../../../../shared/components/unlink-logs/unlink-logs';
import {
  TABLE_ACTION_VIEW_DETAIL,
  TABLE_ACTION_VIEW_TICKETS,
  TABLE_ACTION_DASHBOARD_DELETE,
  TABLE_ACTION_VIEW_UNLINK_LOGS,
} from '../../../../core/helpers/ui/constants';
import { STATE_DELETED } from '../../../../core/helpers/global/raffle.constants';
import { Raffle } from '../../../../core/interfaces/api/raffle.interface';

export interface DashboardCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SimpleCard,
    CommonModule,
    FormsModule,
    Tables,
    DeleteModal,
    HistoryRafflesModal,
    HistoryTicketModel,
    UnlinkLogs,
    NgSelectComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private readonly raffleService = inject(RaffleService);
  private readonly categoryService = inject(CategoryService);
  private readonly foundationService = inject(FoundationService);
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly themeService = inject(ThemeService);

  private lastChartsData = signal<any>(null);

  constructor() {
    effect(() => {
      const charts = this.lastChartsData();
      const theme = this.themeService.currentTheme();
      if (charts) {
        this.renderCharts(charts);
      }
    });
  }

  private getThemeColors() {
    const isDark = this.themeService.currentTheme() === 'dark';
    return {
      textColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      tickColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    };
  }

  userName = DEFAULT_USER_NAME;
  principalHeader = DASHBOARD_PRINCIPAL_HEADER;
  selectedRaffle: RaffleDetail | null = null;
  selectedTicketData: TicketHistoryData | null = null;
  selectedRaffleForLogs: Raffle | null = null;

  showDeleteModal = false;
  showRaffleModal = false;
  showTicketsModal = false;
  showLogsModal = false;

  cards: DashboardCard[] = [];
  welcomeGreeting: string = '';
  currentDate: string = '';

  dashboardColumns = DASHBOARD_COLUMNS;
  dashboardActions = HISTORY_ROW_ACTIONS;

  rifaSeleccionadaParaBorrar: Raffle | null = null;
  rifaSeleccionadaParaVer: Raffle | null = null;

  pageSize = PERSO_PAGE_SIZE;
  loading = false;
  loadingMetricas = false;

  @ViewChild('startDateInput') startDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endDateInput') endDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('trendChartCanvas') trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas') categoryChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topRafflesChartCanvas') topRafflesChartCanvas!: ElementRef<HTMLCanvasElement>;

  startDatePicker?: flatpickr.Instance;
  endDatePicker?: flatpickr.Instance;

  startDateFilter: string | null = null;
  endDateFilter: string | null = null;
  categoryFilter: string | null = null;
  foundationFilter: string | null = null;
  minCollectedFilter: number | null = null;
  maxCollectedFilter: number | null = null;

  tempStartDateFilter: string | null = null;
  tempEndDateFilter: string | null = null;
  tempCategoryFilter: string | null = null;
  tempFoundationFilter: string | null = null;
  tempMinCollectedFilter: number | null = null;
  tempMaxCollectedFilter: number | null = null;

  categoriesList: any[] = [];
  categoriesPage = 1;
  categoriesTotalCount = 0;
  categoriesLoading = false;

  foundationsList: any[] = [];
  foundationsPage = 1;
  foundationsTotalCount = 0;
  foundationsLoading = false;

  trendChart: any = null;
  categoryChart: any = null;
  topRafflesChart: any = null;

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.initWelcomeMessage();
    this.cargarMetricas();
    setTimeout(() => {
      this.cargarRifas();
    });
  }

  ngAfterViewInit() {
    this.initFlatpickr();
  }

  ngOnDestroy(): void {
    if (this.startDatePicker) {
      this.startDatePicker.destroy();
    }
    if (this.endDatePicker) {
      this.endDatePicker.destroy();
    }
  }

  loadCategoriesIfNeeded(): void {
    if (this.categoriesList.length === 0) {
      this.loadCategories(1);
    }
  }

  loadFoundationsIfNeeded(): void {
    if (this.foundationsList.length === 0) {
      this.loadFoundations(1);
    }
  }

  loadCategories(page = 1): void {
    this.categoriesLoading = true;
    this.cdr.detectChanges();
    this.categoryService
      .getActive(page, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.categoriesLoading = false;
          if (res && res.data) {
            if (page === 1) {
              this.categoriesList = res.data;
            } else {
              this.categoriesList = [...this.categoriesList, ...res.data];
            }
            this.categoriesPage = page;
            this.categoriesTotalCount = res.totalCount || 0;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Dashboard: error al cargar categorías', err);
          this.categoriesLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadMoreCategories(): void {
    if (this.categoriesLoading || this.categoriesList.length >= this.categoriesTotalCount) return;
    this.loadCategories(this.categoriesPage + 1);
  }

  loadFoundations(page = 1): void {
    this.foundationsLoading = true;
    this.cdr.detectChanges();
    this.foundationService
      .getActive(page, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.foundationsLoading = false;
          if (res && res.data) {
            if (page === 1) {
              this.foundationsList = res.data;
            } else {
              this.foundationsList = [...this.foundationsList, ...res.data];
            }
            this.foundationsPage = page;
            this.foundationsTotalCount = res.totalCount || 0;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Dashboard: error al cargar fundaciones', err);
          this.foundationsLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadMoreFoundations(): void {
    if (this.foundationsLoading || this.foundationsList.length >= this.foundationsTotalCount) return;
    this.loadFoundations(this.foundationsPage + 1);
  }

  initFlatpickr() {
    if (this.startDateInput && this.startDateInput.nativeElement) {
      this.startDatePicker = flatpickr(this.startDateInput.nativeElement as any, {
        locale: Spanish,
        dateFormat: 'Y-m-d',
        disableMobile: true,
        allowInput: true,
        position: 'auto right',
        onChange: (selectedDates, dateStr) => {
          this.tempStartDateFilter = dateStr || null;
          if (this.endDatePicker) {
            this.endDatePicker.set('minDate', dateStr || undefined);
          }
        },
      });
    }

    if (this.endDateInput && this.endDateInput.nativeElement) {
      this.endDatePicker = flatpickr(this.endDateInput.nativeElement as any, {
        locale: Spanish,
        dateFormat: 'Y-m-d',
        disableMobile: true,
        allowInput: true,
        position: 'auto right',
        onChange: (selectedDates, dateStr) => {
          this.tempEndDateFilter = dateStr || null;
        },
      });
    }
  }

  sincronizarFiltrosATemp(): void {
    this.tempStartDateFilter = this.startDateFilter;
    this.tempEndDateFilter = this.endDateFilter;
    this.tempCategoryFilter = this.categoryFilter;
    this.tempFoundationFilter = this.foundationFilter;
    this.tempMinCollectedFilter = this.minCollectedFilter;
    this.tempMaxCollectedFilter = this.maxCollectedFilter;

    // Update flatpickr inputs if instances exist
    if (this.startDatePicker) {
      if (this.startDateFilter) {
        this.startDatePicker.setDate(this.startDateFilter, false);
      } else {
        this.startDatePicker.clear(false);
      }
    }

    if (this.endDatePicker) {
      if (this.endDateFilter) {
        this.endDatePicker.setDate(this.endDateFilter, false);
      } else {
        this.endDatePicker.clear(false);
      }
    }
  }

  aplicarFiltros(): void {
    this.startDateFilter = this.tempStartDateFilter;
    this.endDateFilter = this.tempEndDateFilter;
    this.categoryFilter = this.tempCategoryFilter;
    this.foundationFilter = this.tempFoundationFilter;
    this.minCollectedFilter = this.tempMinCollectedFilter;
    this.maxCollectedFilter = this.tempMaxCollectedFilter;

    this.cargarMetricas();
    this.cargarRifas();

    // Close offcanvas
    const element = document.getElementById('offcanvasFilters');
    if (element) {
      const bootstrapApi = (window as any).bootstrap;
      if (bootstrapApi) {
        try {
          const bsOffcanvas = bootstrapApi.Offcanvas.getInstance(element);
          if (bsOffcanvas) bsOffcanvas.hide();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  limpiarFiltros(): void {
    this.startDateFilter = null;
    this.endDateFilter = null;
    this.categoryFilter = null;
    this.foundationFilter = null;
    this.minCollectedFilter = null;
    this.maxCollectedFilter = null;

    this.tempStartDateFilter = null;
    this.tempEndDateFilter = null;
    this.tempCategoryFilter = null;
    this.tempFoundationFilter = null;
    this.tempMinCollectedFilter = null;
    this.tempMaxCollectedFilter = null;

    if (this.startDatePicker) {
      this.startDatePicker.clear(false);
    }
    if (this.endDatePicker) {
      this.endDatePicker.clear(false);
      this.endDatePicker.set('minDate', undefined);
    }

    this.cargarMetricas();
    this.cargarRifas();

    // Close offcanvas
    const element = document.getElementById('offcanvasFilters');
    if (element) {
      const bootstrapApi = (window as any).bootstrap;
      if (bootstrapApi) {
        try {
          const bsOffcanvas = bootstrapApi.Offcanvas.getInstance(element);
          if (bsOffcanvas) bsOffcanvas.hide();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  cargarMetricas(): void {
    this.cards = [];
    this.loadingMetricas = true;
    this.cdr.detectChanges();

    this.raffleService
      .getDashboardMetrics({
        startDate: this.startDateFilter,
        endDate: this.endDateFilter,
        category: this.categoryFilter,
        foundationId: this.foundationFilter,
        minCollected: this.minCollectedFilter,
        maxCollected: this.maxCollectedFilter,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loadingMetricas = false;
          if (!res?.data) {
            this.cdr.detectChanges();
            return;
          }
          // El servicio ya desenvuelve la respuesta; `res.data` contiene directamente las métricas
          const metrics = res.data ?? {};
          const charts = res.charts;
          const safeMetrics = {
            totalCollected: metrics.totalCollected ?? 0,
            totalBeneficiaries: metrics.totalBeneficiaries ?? 0,
            totalWinners: metrics.totalWinners ?? 0,
            totalActive: metrics.totalActive ?? 0,
            totalNoTickets: metrics.totalNoTickets ?? 0,
            totalFinished: metrics.totalFinished ?? 0,
          };
          this.cards = [
            {
              label: 'Recaudado',
              value: `${safeMetrics.totalCollected.toLocaleString('es-MX')} $`,
              icon: 'bi-cash-coin',
              color: 'success',
            },
            {
              label: 'Beneficiarios',
              value: String(metrics.totalBeneficiaries || 0),
              icon: 'bi-heart-fill',
              color: 'danger',
            },
            {
              label: 'Premiados',
              value: String(metrics.totalWinners || 0),
              icon: 'bi-trophy-fill',
              color: 'warning',
            },
            {
              label: 'Activas',
              value: String(metrics.totalActive || 0),
              icon: 'bi-play-circle-fill',
              color: 'info',
            },
            {
              label: 'Sin boletos',
              value: String(metrics.totalNoTickets || 0),
              icon: 'bi-ticket-detailed-fill',
              color: 'secondary',
            },
            {
              label: 'Finalizados',
              value: String(metrics.totalFinished || 0),
              icon: 'bi-check-circle-fill',
              color: 'primary',
            },
          ];

          if (charts) {
            this.lastChartsData.set(charts);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error: No se pudieron cargar las métricas para el dashboard.', err);
          this.loadingMetricas = false;
          this.cdr.detectChanges();
        },
      });
  }
  /** TrackBy function for cards */
  trackByLabel(index: number, item: DashboardCard): string {
    return item.label;
  }


  renderCharts(chartsData: any): void {
    this.destroyCharts();

    this.renderTrendChart(chartsData.salesTrendData);
    this.renderCategoryChart(chartsData.categoryData);
    this.renderTopRafflesChart(chartsData.topRafflesData);
  }

  // ----- Helpers de renderCharts -----

  /** Libera instancias previas de los 3 charts para evitar leaks en re-renders. */
  private destroyCharts(): void {
    if (this.trendChart) this.trendChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.topRafflesChart) this.topRafflesChart.destroy();
  }

  /** Devuelve el context 2D de un canvas o null si el elemento no está listo. */
  private getCanvasContext(canvas: ElementRef<HTMLCanvasElement> | undefined): CanvasRenderingContext2D | null {
    return canvas?.nativeElement?.getContext('2d') ?? null;
  }

  /** Opciones de tema oscuro compartidas por los charts de línea y barra. */
  private readonly darkAxisOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: DARK_AXIS_TICKS } },
      y: { grid: { color: DARK_AXIS_GRID }, ticks: { color: DARK_AXIS_TICKS } },
    },
  };

  /** Acorta labels largos para que no rompan el eje X del chart de barras. */
  private truncateLabel(label: string, max = 15): string {
    return label.length > max ? `${label.substring(0, max)}...` : label;
  }

  /**
   * Toma una lista de {label,value}, ordena descendente y devuelve las top N
   * categorías más el resto acumulado en una entrada "Otros". Si hay <= N entradas,
   * devuelve la lista tal cual.
   */
  private topNPlusOtros(items: Array<{ label: string; value: number }>, n: number = DOUGHNUT_TOP_N) {
    const sorted = [...items].sort((a, b) => b.value - a.value);
    if (sorted.length <= n) {
      return {
        labels: sorted.map((i) => i.label),
        data: sorted.map((i) => i.value),
      };
    }
    const top = sorted.slice(0, n);
    const rest = sorted.slice(n);
    const restSum = rest.reduce((sum, item) => sum + item.value, 0);
    return {
      labels: [...top.map((i) => i.label), 'Otros'],
      data: [...top.map((i) => i.value), restSum],
    };
  }

  // ----- 3 charts -----

  private renderTrendChart(salesTrendData: Array<{ label: string; value: number }>): void {
    const ctx = this.getCanvasContext(this.trendChartCanvas);
    if (!ctx) return;

    const { tickColor, gridColor } = this.getThemeColors();

    const labels = salesTrendData.map((d) => d.label);
    const data = salesTrendData.map((d) => d.value);

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(13, 110, 253, 0.35)');
    gradient.addColorStop(1, 'rgba(13, 110, 253, 0.0)');

    this.trendChart = new Chart(ctx as any, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Recaudación ($)',
          data,
          borderColor: DASHBOARD_CHART_TREND_COLOR,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: DASHBOARD_CHART_TREND_COLOR,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor } },
        },
      } as any,
    });
  }

  private renderCategoryChart(categoryData: Array<{ label: string; value: number }>): void {
    const ctx = this.getCanvasContext(this.categoryChartCanvas);
    if (!ctx) return;

    const { textColor } = this.getThemeColors();
    const { labels, data } = this.topNPlusOtros(categoryData);

    this.categoryChart = new Chart(ctx as any, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [...DASHBOARD_CHART_PALETTE],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, boxWidth: 12, padding: 15 },
          },
        },
      },
    });
  }

  private renderTopRafflesChart(topRafflesData: Array<{ label: string; value: number }>): void {
    const ctx = this.getCanvasContext(this.topRafflesChartCanvas);
    if (!ctx) return;

    const { textColor, tickColor, gridColor } = this.getThemeColors();

    const labels = topRafflesData.map((d) => d.label);
    const data = topRafflesData.map((d) => d.value);

    this.topRafflesChart = new Chart(ctx as any, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Recaudado ($)',
          data,
          backgroundColor: [...DASHBOARD_CHART_PALETTE],
          borderRadius: 5,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 15,
              generateLabels: (chart: any) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  const dataset = data.datasets[0];
                  return data.labels.map((label: string, i: number) => ({
                    text: label,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.backgroundColor[i],
                    fontColor: textColor,
                    color: textColor,
                    lineWidth: 0,
                    hidden: false,
                    index: i
                  }));
                }
                return [];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { display: false }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: tickColor }
          }
        }
      } as any,
    });
  }

  cargarRifas(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.cargarMetricas();

    this.raffleService
      .getAll(1, 10, '', 'FINISHED,PENDING-DRAW', undefined, 'recent', '{"endDate":-1}')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.recentRaffles = res.data;
            this.tableData = res.data.map((raffle) => mapRaffleForTable(raffle));
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('API Error: No se pudieron cargar las rifas para el dashboard.', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private initWelcomeMessage() {
    try {
      const now = new Date();
      const hour = now.getHours();
      let greeting = '¡Hola';
      if (hour >= 6 && hour < 12) {
        greeting = '¡Buenos días';
      } else if (hour >= 12 && hour < 19) {
        greeting = '¡Buenas tardes';
      } else {
        greeting = '¡Buenas noches';
      }
      this.welcomeGreeting = greeting;

      const formattedDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now);
      this.currentDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch {
      this.welcomeGreeting = '¡Bienvenido';
      this.currentDate = '';
    }
  }

  private readonly BTN_HISTORY_MODAL_ID = 'btn-abrir-modal-history';
  private readonly BTN_TICKETS_MODAL_ID = 'btn-abrir-modal-tickets';
  private readonly BTN_DELETE_MODAL_ID = 'btn-abrir-modal-delete';

  onCloseDeleteModal(): void {
    this.showDeleteModal = false;
    this.rifaSeleccionadaParaBorrar = null;
  }

  onCloseRaffleModal(): void {
    this.showRaffleModal = false;
    this.selectedRaffle = null;
    this.rifaSeleccionadaParaVer = null;
  }

  onCloseTicketsModal(): void {
    this.showTicketsModal = false;
    this.selectedTicketData = null;
  }

  onCloseLogsModal(): void {
    this.showLogsModal = false;
    this.selectedRaffleForLogs = null;
  }

  manejarAccion(evento: { actionId: number; row: Raffle }) {
    try {
      const actions: Record<number, () => void> = {
        [TABLE_ACTION_VIEW_DETAIL]: () => {
          this.rifaSeleccionadaParaVer = evento.row;
          this.onViewDetails(evento.row);
          this.showRaffleModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_HISTORY_MODAL_ID)?.click();
        },
        [TABLE_ACTION_VIEW_TICKETS]: () => {
          this.onViewTicketDetails(evento.row);
          this.showTicketsModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_TICKETS_MODAL_ID)?.click();
        },
        [TABLE_ACTION_DASHBOARD_DELETE]: () => {
          this.rifaSeleccionadaParaBorrar = evento.row;
          this.showDeleteModal = true;
          this.cdr.detectChanges();
          document.getElementById(this.BTN_DELETE_MODAL_ID)?.click();
        },
        [TABLE_ACTION_VIEW_UNLINK_LOGS]: () => {
          this.selectedRaffleForLogs = evento.row;
          this.showLogsModal = true;
          this.cdr.detectChanges();
          document.getElementById('btn-abrir-modal-unlink-logs')?.click();
        },
      };

      const action = actions[evento.actionId];
      if (!action) throw new Error();
      action();
    } catch {}
  }

  confirmarEliminar(razon: string) {
    const targetRaffle = this.rifaSeleccionadaParaBorrar;
    if (!targetRaffle) return;

    this.raffleService
      .deleteRaffle(targetRaffle._id, razon)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cargarRifas();
        },
        error: (err) => {
          console.error('API Error: No se pudo eliminar la rifa.', err);
        },
      });
    this.rifaSeleccionadaParaBorrar = null;
  }

  onViewTicketDetails(raffle: Raffle) {
    this.selectedTicketData = null;
    this.ticketService
      .getTicketsByRaffle(raffle._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.selectedTicketData = mapTicketDetails(res.data, raffle);
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('API Error: No se pudieron cargar los boletos del backend.', err);
        },
      });
  }

  onViewDetails(raffle: Raffle) {
    this.selectedRaffle = mapRaffleDetails(raffle);
  }

  recentRaffles: Raffle[] = [];
  tableData: Raffle[] = [];
}
