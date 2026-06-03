import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelChange } from '../../../core/interfaces/api/model-change.interface';

@Component({
  selector: 'app-confirm-changes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-changes-modal.html',
  styleUrl: './confirm-changes-modal.scss',
})
export class ConfirmChangesModal {
  @Input() title = 'Confirmar Cambios';
  @Input() description = 'Se han detectado los siguientes cambios. Por favor, confirma si deseas guardarlos:';
  @Input() changes: ModelChange[] = [];
  @Input() isOpen = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
