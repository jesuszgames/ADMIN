import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownAction {
  id: number;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class Dropdown {
  @Input({ required: true }) valueLabel: string = '•••';
  @Input({ required: true }) listActions: DropdownAction[] = [];

  @Output() actionSelected = new EventEmitter<number>();

  onActionClick(id: number, event: Event) {
    event.preventDefault();
    this.actionSelected.emit(id);
  }
}
