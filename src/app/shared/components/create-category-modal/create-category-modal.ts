import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, AVAILABLE_CATEGORIES_ICONS } from '../../../core/helpers/constants/categories-constants';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-category-modal.html',
  styleUrl: './create-category-modal.scss',
})
export class CreateCategoryModal implements OnChanges {
  @Input() category: Category | null = null;
  @Output() save = new EventEmitter<Category>();

  nombre = '';
  descripcion = '';
  selectedIcon = 'bi-paw';

  availableIcons = AVAILABLE_CATEGORIES_ICONS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.category) {
      this.nombre = this.category.nombre || '';
      this.descripcion = this.category.descripcion || '';
      this.selectedIcon = this.category.icon || 'bi-paw';
    } else {
      this.nombre = '';
      this.descripcion = '';
      this.selectedIcon = 'bi-paw';
    }
  }

  isFormValid(): boolean {
    return this.nombre.trim() !== '' && this.descripcion.trim() !== '';
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const data: Category = {
      id: this.category?.id ?? 0,
      estado: this.category?.estado ?? 'ACTIVO',
      acciones: this.category?.acciones ?? '',
      nombre: this.nombre.toUpperCase().trim(),
      descripcion: this.descripcion.trim(),
      icon: this.selectedIcon,
    };

    this.save.emit(data);
  }
}
