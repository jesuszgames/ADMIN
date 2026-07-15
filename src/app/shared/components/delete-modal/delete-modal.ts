import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.scss',
})
export class DeleteModal {
  @Input() id!: string;
  @Input() itemName?: string;
  @Output() confirmDelete = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  razon: string = '';

  get isReasonValid(): boolean {
    const trimmed = (this.razon || '').trim();
    return trimmed.length >= 10 && trimmed.length <= 500;
  }

  onConfirm(): void {
    if (this.isReasonValid) {
      this.confirmDelete.emit(this.razon);
      this.razon = '';
    }
  }

  onModalClosed(): void {
    this.razon = '';
    this.closed.emit();
  }
}
