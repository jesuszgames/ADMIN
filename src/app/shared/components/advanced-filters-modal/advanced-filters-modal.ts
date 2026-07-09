import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CategoryService } from '../../../core/services/api/category.service';
import { FoundationService } from '../../../core/services/api/foundation.service';
import { Category } from '../../../core/interfaces/api/category.interface';
import { Foundation } from '../../../core/interfaces/api/foundation.interface';

@Component({
  selector: 'app-advanced-filters-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent],
  templateUrl: './advanced-filters-modal.html',
  styleUrl: './advanced-filters-modal.scss',
})
export class AdvancedFiltersModal implements OnChanges {
  private readonly categoryService = inject(CategoryService);
  private readonly foundationService = inject(FoundationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() selectedCategory: string = '';
  @Input() selectedFoundation: string = '';
  @Input() isModal: boolean = false;
  @Input() statusOptions: { id: string; label: string; icon?: string }[] = [];
  @Input() selectedStatus: string = '';

  @Output() filterApplied = new EventEmitter<{
    category: string;
    foundation: string;
    status: string;
  }>();

  tempCategory: string | null = null;
  tempFoundation: string | null = null;
  tempStatus: string = 'all';
  categories: Category[] = [];
  categoriesLoading = false;
  foundations: Foundation[] = [];
  foundationsLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] || changes['selectedFoundation'] || changes['selectedStatus']) {
      this.tempCategory = this.selectedCategory || null;
      this.tempFoundation = this.selectedFoundation || null;
      this.tempStatus = this.selectedStatus || 'all';
    }
  }

  categoriesPage = 1;
  categoriesTotalCount = 0;
  foundationsPage = 1;
  foundationsTotalCount = 0;

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
              this.categories = res.data;
            } else {
              this.categories = [...this.categories, ...res.data];
            }
            this.categoriesPage = page;
            this.categoriesTotalCount = res.totalCount || 0;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('AdvancedFiltersModal: error al cargar categorías', err);
          this.categoriesLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadCategoriesIfNeeded(): void {
    if (this.categories.length === 0) {
      this.loadCategories(1);
    }
  }

  loadMoreCategories(): void {
    if (this.categoriesLoading || this.categories.length >= this.categoriesTotalCount) return;
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
              this.foundations = res.data;
            } else {
              this.foundations = [...this.foundations, ...res.data];
            }
            this.foundationsPage = page;
            this.foundationsTotalCount = res.totalCount || 0;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('AdvancedFiltersModal: error al cargar fundaciones', err);
          this.foundationsLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadFoundationsIfNeeded(): void {
    if (this.foundations.length === 0) {
      this.loadFoundations(1);
    }
  }

  loadMoreFoundations(): void {
    if (this.foundationsLoading || this.foundations.length >= this.foundationsTotalCount) return;
    this.loadFoundations(this.foundationsPage + 1);
  }

  clearFilters(): void {
    this.tempCategory = null;
    this.tempFoundation = null;
    this.tempStatus = 'all';
    this.apply();
  }

  closeCollapse(): void {
    const element = document.getElementById('collapseFiltrosAvanzados');
    if (!element) return;

    const bootstrapApi = window.bootstrap;
    if (bootstrapApi) {
      try {
        const bsCollapse =
          bootstrapApi.Collapse.getInstance(element) ?? new bootstrapApi.Collapse(element);
        bsCollapse.hide();
        return;
      } catch (e) {
        console.error('Error invoking Bootstrap Collapse JS API', e);
      }
    }

    element.classList.remove('show');
    const triggers = document.querySelectorAll('[data-bs-target="#collapseFiltrosAvanzados"]');
    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.classList.add('collapsed');
    });
  }

  apply(): void {
    this.filterApplied.emit({
      category: this.tempCategory || '',
      foundation: this.tempFoundation || '',
      status: this.tempStatus || 'all',
    });
  }
}
