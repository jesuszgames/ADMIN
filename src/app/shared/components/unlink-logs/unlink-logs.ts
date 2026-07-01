import { Component, Input, OnChanges, OnInit, SimpleChanges, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Raffle, UnlinkLog } from '../../../core/interfaces/api/raffle.interface';
import { TicketService, BackendUnlinkLog } from '../../../core/services/api/ticket.service';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-unlink-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './unlink-logs.html',
  styleUrl: './unlink-logs.scss',
})
export class UnlinkLogs implements OnInit, OnChanges {
  @Input() raffleData: Raffle | null = null;
  
  private ticketService = inject(TicketService);
  private destroyRef = inject(DestroyRef);
  
  logs: UnlinkLog[] = [];
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  
  currentPage: number = 1;
  limit: number = 10;
  totalCount: number = 0;
  isLoading: boolean = false;

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.loadLogs();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['raffleData'] && this.raffleData) {
      this.currentPage = 1;
      this.searchTerm = '';
      this.logs = [];
      this.totalCount = 0;
      this.loadLogs();
    }
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  loadLogs() {
    if (!this.raffleData || !this.raffleData._id) return;
    
    this.isLoading = true;
    this.ticketService.getUnlinkedLogs(
      this.raffleData._id,
      this.currentPage,
      this.limit,
      this.searchTerm.trim() || undefined
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        this.isLoading = false;
        const result = res?.data;
        let rawLogs: BackendUnlinkLog[] = [];
        
        if (result) {
          if (!Array.isArray(result) && result.result) {
            rawLogs = result.result;
            this.totalCount = result.totalCount || 0;
          } else if (Array.isArray(result)) {
            rawLogs = result;
            this.totalCount = result.length;
          }
        }
        
        this.logs = rawLogs.map((log: BackendUnlinkLog) => {
          const userVal = log.userId
            ? typeof log.userId === 'object'
              ? log.userId.name || log.userId.username
              : log.userId
            : 'User';
          return {
            number: log.number,
            user:
              typeof userVal === 'object'
                ? (userVal as { name?: string; username?: string }).name ||
                  (userVal as { name?: string; username?: string }).username ||
                  'User'
                : String(userVal),
            purchaseId: log.purchaseId,
            reason: log.reason,
            date: log.date,
          };
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error: No se pudieron cargar logs de desvinculados', err);
        this.logs = [];
        this.totalCount = 0;
      }
    });
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.limit) || 1;
  }

  get uniqueUsersCount(): number {
    const users = new Set(this.logs.map(log => log.user));
    return users.size;
  }

  getVentasPercentage(): number {
    if (!this.raffleData || !this.raffleData.totalTickets) return 0;
    return Math.round((this.raffleData.soldTickets / this.raffleData.totalTickets) * 100);
  }

  getStatusClass(): string {
    if (!this.raffleData) return '';
    switch (this.raffleData.status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-success bg-opacity-20 text-success border border-success border-opacity-20';
      case 'FINISHED':
        return 'bg-primary bg-opacity-20 text-primary border border-primary border-opacity-20';
      case 'DELETED':
        return 'bg-danger bg-opacity-20 text-danger border border-danger border-opacity-20';
      default:
        return 'bg-secondary bg-opacity-20 text-secondary border border-secondary border-opacity-20';
    }
  }
}
