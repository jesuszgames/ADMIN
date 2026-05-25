import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  @Input() placeholder: string = 'Buscar...';
  @Output() onSearch = new EventEmitter<string>();

  onTyping(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onSearch.emit(input.value);
  }
}
