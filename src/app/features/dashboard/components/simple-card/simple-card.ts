import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-card.html',
  styleUrl: './simple-card.scss',
})
export class SimpleCard {
  @Input() name: string = '';
  @Input() value: string | number = '0';
  @Input() icon?: string;
  @Input() color: string = 'primary';
}
