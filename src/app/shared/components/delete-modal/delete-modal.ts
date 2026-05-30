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
  @Output() confirmDelete = new EventEmitter<string>();

  razon: string = '';

  onConfirm(): void {
    this.confirmDelete.emit(this.razon);
    this.razon = '';
  }
}
