import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
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

  @Input() selectedCategory: string = '';
  @Input() selectedFoundation: string = '';
  @Input() isModal: boolean = false;
  @Input() statusOptions: { id: string; label: string; icon?: string }[] = [];
  @Input() selectedStatus: string = '';

  @Output() filterApplied = new EventEmitter<{ category: string; foundation: string; status: string }>();

  tempCategory: string | null = null;
  tempFoundation: string | null = null;
  tempStatus: string = 'all';
  categories: Category[] = [];
  foundations: Foundation[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] || changes['selectedFoundation'] || changes['selectedStatus']) {
      this.tempCategory = this.selectedCategory || null;
      this.tempFoundation = this.selectedFoundation || null;
      this.tempStatus = this.selectedStatus || 'all';
    }
  }

  loadCategoriesIfNeeded(): void {
    if (this.categories.length === 0) {
      this.categoryService.getAll(1, 100).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.categories = res.data.filter((c: Category) => c.status === 'ACTIVE');
          }
        },
      });
    }
  }

  loadFoundationsIfNeeded(): void {
    if (this.foundations.length === 0) {
      this.foundationService.getAll(1, 100).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.foundations = res.data.filter((f: Foundation) => f.status === 'ACTIVE');
          }
        },
      });
    }
  }

  clearFilters(): void {
    this.tempCategory = null;
    this.tempFoundation = null;
    this.tempStatus = 'all';
    this.apply();
  }

  closeCollapse(): void {
    const element = document.getElementById('collapseFiltrosAvanzados');
    if (element) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap) {
        try {
          const bsCollapse = bootstrap.Collapse.getInstance(element) || new bootstrap.Collapse(element);
          bsCollapse.hide();
          return;
        } catch (e) {
          console.error('Error invoking Bootstrap Collapse JS API', e);
        }
      }
      element.classList.remove('show');
      const triggers = document.querySelectorAll('[data-bs-target="#collapseFiltrosAvanzados"]');
      triggers.forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        t.classList.add('collapsed');
      });
    }
  }

  apply(): void {
    this.filterApplied.emit({
      category: this.tempCategory || '',
      foundation: this.tempFoundation || '',
      status: this.tempStatus || 'all',
    });
  }
}
