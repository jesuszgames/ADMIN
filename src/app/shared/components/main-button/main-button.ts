import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-button.html',
  styleUrl: './main-button.scss',
})
export class MainButton {
  @Input() label: string = '';
  @Input() icon: string = 'bi-plus';

  @Output() btnClick = new EventEmitter<void>();

  onClick(): void {
    this.btnClick.emit();
  }
}
