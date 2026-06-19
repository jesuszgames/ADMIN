import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelChange } from '../../../core/interfaces/api/model-change.interface';

@Component({
  selector: 'app-confirm-changes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-changes-modal.html',
  styleUrl: './confirm-changes-modal.scss',
})
export class ConfirmChangesModal implements OnChanges, OnDestroy {
  @Input() title = 'Confirmar Cambios';
  @Input() description = 'Se han detectado los siguientes cambios. Por favor, confirma si deseas guardarlos:';
  @Input() changes: ModelChange[] = [];
  @Input() isOpen = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  onConfirm() {
    document.body.style.overflow = '';
    this.confirm.emit();
  }

  onCancel() {
    document.body.style.overflow = '';
    this.cancel.emit();
  }
}
