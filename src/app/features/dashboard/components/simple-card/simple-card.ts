import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-simple-card',
  standalone: true,
  templateUrl: './simple-card.html',

})
export class SimpleCard {
  @Input() name: string = '';
  @Input() value: string |number = '0';
}
