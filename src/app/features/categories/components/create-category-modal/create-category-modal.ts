import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AVAILABLE_CATEGORIES_ICONS } from '../../../../core/helpers/global/category.constants';
import { Category } from '../../../../core/interfaces/api/category.interface';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal, NgSelectComponent],
  templateUrl: './create-category-modal.html',
  styleUrl: './create-category-modal.scss',
})
export class CreateCategoryModal implements OnChanges {
  @Input() category: Category | null = null;
  @Input() isReadOnly = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<Category>();
  @Output() closed = new EventEmitter<void>();

  name = '';
  description = '';
  selectedIcon = '';

  availableIcons = AVAILABLE_CATEGORIES_ICONS;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.category) {
      this.name = this.category.name || '';
      this.description = this.category.description || '';
      this.selectedIcon = this.category.icon || '';
    } else {
      this.name = '';
      this.description = '';
      this.selectedIcon = '';
    }
  }

  isFormValid(): boolean {
    const nameLen = this.name.trim().length;
    const descLen = this.description.trim().length;
    const iconLen = this.selectedIcon.trim().length;
    return nameLen >= 3 && nameLen <= 50 &&
           descLen >= 10 && descLen <= 500 &&
           iconLen >= 5 && iconLen <= 50;
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.category) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: any, nuevo: any) => {
      const normAnterior = (anterior === null || anterior === undefined) ? '' : String(anterior).trim();
      const normNuevo = (nuevo === null || nuevo === undefined) ? '' : String(nuevo).trim();
      if (normAnterior !== normNuevo) {
        this.cambios.push({ campo, anterior: normAnterior || '(Vacío)', nuevo: normNuevo || '(Vacío)' });
      }
    };

    checkChange('Nombre Categoría', this.category.name, this.name.toUpperCase().trim());
    checkChange('Descripción', this.category.description, this.description.trim());
    checkChange('Icono', this.category.icon, this.selectedIcon);

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid() || this.isSaving) return;

    if (this.category) {
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

    const data: Category = {
      _id: this.category?._id ?? '',
      status: this.category?.status ?? 'ACTIVE',
      actions: this.category?.actions ?? '',
      name: this.name.toUpperCase().trim(),
      description: this.description.trim(),
      icon: this.selectedIcon,
    };


    this.save.emit(data);
  }

  onModalClosed() {
    this.resetForm();
    this.closed.emit();
  }
}
