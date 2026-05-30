import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/interfaces/api/user.interface';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal],
  templateUrl: './edit-user-modal.html',
  styleUrl: './edit-user-modal.scss',
})
export class EditUserModal implements OnChanges {
  @Input() user: User | null = null;
  @Input() isReadOnly = false;
  @Output() save = new EventEmitter<User>();

  name: string = '';
  email: string = '';
  phone: string = '';
  role: 'ADMIN' | 'SORTEADOR' | 'USUARIO' = 'USUARIO';
  deleteReason: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.name = this.user.name || '';
      this.email = this.user.email || '';
      this.phone = this.user.phone || '';
      this.role = this.user.role || 'USUARIO';
      this.deleteReason = this.user.deleteReason || '';
    }
  }

  isFormValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.phone.trim().length > 0 &&
      (this.role === 'USUARIO' || this.role === 'SORTEADOR' || this.role === 'ADMIN')
    );
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.user) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: any, nuevo: any) => {
      const normAnterior = (anterior === null || anterior === undefined) ? '' : String(anterior).trim();
      const normNuevo = (nuevo === null || nuevo === undefined) ? '' : String(nuevo).trim();
      if (normAnterior !== normNuevo) {
        this.cambios.push({ campo, anterior: normAnterior || '(Vacío)', nuevo: normNuevo || '(Vacío)' });
      }
    };

    checkChange('Nombre Completo', this.user.name, this.name);
    checkChange('Correo Electrónico', this.user.email, this.email);
    checkChange('Teléfono', this.user.phone, this.phone);
    checkChange('Rol de Usuario', this.user.role, this.role);

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid()) return;

    if (this.user) {
      const hasChanges = this.detectarCambios();
      if (hasChanges) {
        this.showConfirmModal = true;
      } else {
        this.onSave();
        document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
      }
    } else {
      this.onSave();
      document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSave();
    document.getElementById('btn-cerrar-modal-editar-usuario')?.click();
  }

  onSave(): void {
    if (!this.user) return;
    const updatedUser: User = {
      ...this.user,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
    };
    this.save.emit(updatedUser);
  }
}
