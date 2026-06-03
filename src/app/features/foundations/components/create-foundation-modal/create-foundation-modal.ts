import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Foundation } from '../../../../core/interfaces/api/foundation.interface';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ImageCropperComponent } from '../../../../shared/components/image-cropper/image-cropper';

@Component({
  selector: 'app-create-foundation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal, ImageCropperComponent],
  templateUrl: './create-foundation-modal.html',
  styleUrl: './create-foundation-modal.scss',
})
export class CreateFoundationModal implements OnChanges {
  @Input() foundation: Foundation | null = null;
  @Input() isReadOnly = false;
  @Output() save = new EventEmitter<Foundation>();
  @Output() closed = new EventEmitter<void>();

  name = '';
  description = '';
  email = '';
  phone = '';
  photo: string | Blob | File | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['foundation']) {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.foundation) {
      this.name = this.foundation.name || '';
      this.description = this.foundation.description || '';
      this.email = this.foundation.email || '';
      this.phone = this.foundation.phone || '';
      this.photo = this.foundation.photo || null;
    } else {
      this.name = '';
      this.description = '';
      this.email = '';
      this.phone = '';
      this.photo = null;
    }
  }

  isEmailValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  esNumero(val: string): boolean {
    return /^\d+$/.test((val || '').trim());
  }

  soloNumeros(event: KeyboardEvent): void {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode || event.keyCode);
    if (event.charCode !== 0 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  isFormValid(): boolean {
    const trimmedName = (this.name || '').trim();
    const trimmedDesc = (this.description || '').trim();
    const trimmedEmail = (this.email || '').trim();
    const trimmedPhone = (this.phone || '').trim();
    const hasPhoto = this.photo !== null && this.photo !== '';

    return (
      trimmedName.length >= 3 && trimmedName.length <= 50 &&
      trimmedDesc.length >= 10 && trimmedDesc.length <= 500 &&
      this.isEmailValid(trimmedEmail) &&
      this.esNumero(trimmedPhone) &&
      trimmedPhone.length >= 10 && trimmedPhone.length <= 15 &&
      hasPhoto
    );
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.foundation) return false;
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

    checkChange('Nombre Fundación', this.foundation.name, this.name.trim());
    checkChange('Descripción', this.foundation.description, this.description.trim());
    checkChange('Correo Electrónico', this.foundation.email, this.email.trim());
    checkChange('Teléfono', this.foundation.phone, this.phone.trim());

    if ((this.foundation.photo || '') !== (this.photo || '')) {
      this.cambios.push({
        campo: 'Imagen',
        anterior: this.foundation.photo ? 'Imagen Anterior' : '(Sin Imagen)',
        nuevo: this.photo ? 'Nueva Imagen' : '(Sin Imagen)',
      });
    }

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid()) return;

    if (this.foundation) {
      const hasChanges = this.detectarCambios();
      if (hasChanges) {
        this.showConfirmModal = true;
      } else {
        this.onSubmit();
        document.getElementById('btn-cerrar-modal-crear-fundacion')?.click();
      }
    } else {
      this.onSubmit();
      document.getElementById('btn-cerrar-modal-crear-fundacion')?.click();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSubmit();
    document.getElementById('btn-cerrar-modal-crear-fundacion')?.click();
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const data: Foundation = {
      _id: this.foundation?._id ?? '',
      status: this.foundation?.status ?? 'ACTIVE',
      actions: this.foundation?.actions ?? '',
      name: this.name.trim(),
      description: this.description.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      photo: this.photo,
    };

    if (this.foundation && this.photo && typeof this.photo === 'string' && !this.photo.startsWith('blob:')) {
      delete data.photo;
    }

    this.save.emit(data);
    this.resetForm();
  }

  onModalClosed(): void {
    this.resetForm();
    this.closed.emit();
  }
}
