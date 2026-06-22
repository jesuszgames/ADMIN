import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  StatusFilterId,
  StatusFilterOption,
  STATUS_FILTER_OPTIONS,
} from '../../../core/helpers/global/status-filter.constants';

/**
 * Reusable status filter block rendered in three places to keep the
 * category/foundation/user/player list pages free of duplicated HTML:
 *
 *   1) Desktop inline collapse (md+)
 *   2) Mobile floating trigger button (under md)
 *   3) Mobile offcanvas panel (under md)
 *
 * The component owns a local `tempStatus` two-way bound to the
 * <ng-select>; the parent only sees the value when it emits either
 * `apply` (user pressed "Aplicar") or `reset` (user pressed
 * "Restablecer"). The parent then reloads the data with the new filter.
 *
 * @example
 *   <app-status-filter
 *     [selectedStatus]="selectedStatus"
 *     (apply)="applyFilters()"
 *     (reset)="clearFilters()"
 *   ></app-status-filter>
 */
@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-filter.component.html',
})
export class StatusFilterComponent {
  /** Currently applied status; used to display the "Activo" badge. */
  @Input({ required: true }) selectedStatus!: StatusFilterId;

  /** Emitted when the user clicks "Aplicar". */
  @Output() apply = new EventEmitter<StatusFilterId>();

  /** Emitted when the user clicks "Restablecer". */
  @Output() reset = new EventEmitter<void>();

  /** Available options shown in the ng-select. */
  readonly statusOptions: readonly StatusFilterOption[] = STATUS_FILTER_OPTIONS;

  /** Local copy of the chosen option until "Aplicar" is pressed. */
  tempStatus: StatusFilterId = 'all';

  /**
   * Whenever the parent updates `selectedStatus` (e.g. after pressing
   * "Restablecer"), keep the temp value in sync so the dropdown reflects
   * the canonical state.
   */
  ngOnChanges(): void {
    this.tempStatus = this.selectedStatus;
  }

  onApply(): void {
    this.apply.emit(this.tempStatus);
  }

  onReset(): void {
    this.tempStatus = 'all';
    this.reset.emit();
  }
}