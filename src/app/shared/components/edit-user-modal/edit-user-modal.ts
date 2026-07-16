import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/interfaces/api/user.interface';
import { ConfirmChangesModal } from '../confirm-changes-modal/confirm-changes-modal';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal, NgSelectComponent, NgOptionComponent],
  templateUrl: './edit-user-modal.html',
  styleUrl: './edit-user-modal.scss',
})
export class EditUserModal implements OnChanges {
  @Input() user: User | null = null;
  @Input() isReadOnly = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<User>();

  @Output() closed = new EventEmitter<void>();

  username: string = '';
  password: string = '';
  name: string = '';
  email: string = '';
  phone: string = '';
  role: 'ADMIN' | 'SORTEADOR' | 'USUARIO' = 'USUARIO';
  deleteReason: string = '';
  touchedFields: { [key: string]: boolean } = {};
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.touchedFields = {};
    this.password = '';
    this.showPassword = false;
    if (this.user) {
      this.username = this.user.username || '';
      this.name = this.user.name || '';
      this.email = this.user.email || '';
      this.phone = this.user.phone ? String(this.user.phone) : '';

      const rawRole = this.user.role;
      if (Array.isArray(rawRole)) {
        if (rawRole.includes('admin')) {
          this.role = 'ADMIN';
        } else if (rawRole.includes('sort')) {
          this.role = 'SORTEADOR';
        } else {
          this.role = 'ADMIN';
        }
      } else {
        const roleLower = String(rawRole || '').toLowerCase();
        if (roleLower.includes('admin')) {
          this.role = 'ADMIN';
        } else if (roleLower.includes('sort')) {
          this.role = 'SORTEADOR';
        } else {
          this.role = 'ADMIN';
        }
      }
      this.deleteReason = this.user.deleteReason || '';
    } else {
      this.username = '';
      this.name = '';
      this.email = '';
      this.phone = '';
      this.role = 'ADMIN';
      this.deleteReason = '';
    }
  }

  isEmailValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  esNumero(val: string): boolean {
    return /^\d+$/.test(String(val || '').trim());
  }

  soloNumeros(event: KeyboardEvent): void {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode || event.keyCode);
    if (event.charCode !== 0 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  isFormValid(): boolean {
    const trimmedUsername = String(this.username || '').trim();
    const trimmedName = String(this.name || '').trim();
    const trimmedEmail = String(this.email || '').trim();
    const trimmedPhone = String(this.phone || '').trim();
    const trimmedPassword = String(this.password || '').trim();

    const isPasswordValid = this.user
      ? trimmedPassword.length === 0 || trimmedPassword.length >= 6
      : trimmedPassword.length >= 6;

    return (
      trimmedUsername.length >= 3 &&
      trimmedUsername.length <= 30 &&
      trimmedName.length >= 3 &&
      trimmedName.length <= 50 &&
      this.isEmailValid(trimmedEmail) &&
      this.esNumero(trimmedPhone) &&
      trimmedPhone.length >= 10 &&
      trimmedPhone.length <= 15 &&
      isPasswordValid &&
      (this.role === 'ADMIN' || this.role === 'SORTEADOR')
    );
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.user) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: unknown, nuevo: unknown) => {
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

    checkChange('Nombre de Usuario (Login)', this.user.username, this.username);
    checkChange('Nombre Completo', this.user.name, this.name);
    checkChange('Correo Electrónico', this.user.email, this.email);
    checkChange('Teléfono', this.user.phone, this.phone);
    checkChange(
      'Rol de Usuario',
      Array.isArray(this.user.role) ? this.user.role.join(', ') : this.user.role,
      this.role === 'ADMIN' ? 'admin' : 'sort',
    );
    if (this.password.trim().length > 0) {
      this.cambios.push({
        campo: 'Contraseña',
        anterior: '*****',
        nuevo: 'Nueva Contraseña Establecida',
      });
    }

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid() || this.isSaving) return;

    if (this.user) {
      const hasChanges = this.detectarCambios();
      if (hasChanges) {
        this.showConfirmModal = true;
      } else {
        this.onSave();
      }
    } else {
      this.onSave();
    }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSave();
  }

  onSave(): void {
    if (this.isSaving) return;
    const updatedUser: User = {
      _id: this.user?._id ?? '',
      username: this.username.trim(),
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      role: [this.role === 'ADMIN' ? 'admin' : 'sort'] as unknown as
        | 'ADMIN'
        | 'SORTEADOR'
        | 'USUARIO',
      status: this.user?.status ?? 'ACTIVE',
      actions: this.user?.actions ?? '',
    };
    if (this.password.trim().length >= 6) {
      updatedUser['password'] = this.password.trim();
    }
    this.save.emit(updatedUser);
  }

  onModalClosed(): void {
    this.resetForm();
    this.closed.emit();
  }
}
