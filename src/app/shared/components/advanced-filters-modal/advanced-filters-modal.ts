import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-advanced-filters-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent],
  templateUrl: './advanced-filters-modal.html',
  styleUrl: './advanced-filters-modal.scss',
})
export class AdvancedFiltersModal implements OnChanges, OnInit {
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

  categorySearchSubject = new Subject<string>();
  foundationSearchSubject = new Subject<string>();

  ngOnInit() {
    this.categorySearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.categorySearchTerm = term;
      this.loadCategories(1, true);
    });

    this.foundationSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.foundationSearchTerm = term;
      this.loadFoundations(1, true);
    });
  }

  categoriesPage = 1;
  categoriesTotalCount = 0;
  categorySearchTerm = '';
  foundationsPage = 1;
  foundationsTotalCount = 0;
  foundationSearchTerm = '';

  loadCategories(page = 1, reset = false): void {
    if (reset) {
      this.categoriesPage = 1;
      this.categories = [];
      this.categoriesTotalCount = 0;
    }
    this.categoriesLoading = true;
    this.cdr.detectChanges();
    this.categoryService
      .getActive(page, 10, this.categorySearchTerm)
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

  onCategorySearch(event: { term: string }): void {
    this.categorySearchSubject.next(event.term);
  }

  loadFoundations(page = 1, reset = false): void {
    if (reset) {
      this.foundationsPage = 1;
      this.foundations = [];
      this.foundationsTotalCount = 0;
    }
    this.foundationsLoading = true;
    this.cdr.detectChanges();
    this.foundationService
      .getActive(page, 10, this.foundationSearchTerm)
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

  onFoundationSearch(event: { term: string }): void {
    this.foundationSearchSubject.next(event.term);
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
