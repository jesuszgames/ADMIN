import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  imports: [CommonModule],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.scss',
})
export class DeleteModal {
  @Input() id!: string;
  @Output() confirmDelete = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmDelete.emit();
  }
}
