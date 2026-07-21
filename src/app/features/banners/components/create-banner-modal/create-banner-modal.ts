import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Banner } from '../../../../core/services/api/banner.service';
import { RaffleService } from '../../../../core/services/api/raffle.service';
import { ConfirmChangesModal } from '../../../../shared/components/confirm-changes-modal/confirm-changes-modal';
import { ImageCropperComponent } from '../../../../shared/components/image-cropper/image-cropper';

import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-create-banner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmChangesModal, NgSelectModule, ImageCropperComponent],
  templateUrl: './create-banner-modal.html',
  styleUrl: './create-banner-modal.scss',
})
export class CreateBannerModal implements OnChanges {
  raffles: any[] = [];
  rafflePage = 1;
  isLoadingRaffles = false;
  hasMoreRaffles = true;
  raffleSearchTerm = '';
  raffleSearchSubject = new Subject<string>();
  private sub?: Subscription;
  @Input() banner: Banner | null = null;
  @Input() isReadOnly = false;
  @Input() isSaving = false;
  @Output() save = new EventEmitter<FormData>();
  @Output() closed = new EventEmitter<void>();

  title = '';
  raffleId: string | null = null;
  linkUrl = '';
  
  selectedFile: Blob | File | string | null = null;
  isChangingImage = false;
  
  constructor(private raffleService: RaffleService) {}

  ngOnInit() {
    this.sub = this.raffleSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.raffleSearchTerm = term;
      this.loadRaffles(true);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  touchedFields: { [key: string]: boolean } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['banner']) {
      this.resetForm();
    }
  }

  resetForm() {
    this.touchedFields = {};
    this.selectedFile = null;
    this.isChangingImage = false;

    if (this.banner) {
      this.title = this.banner.title || '';
      
      if (this.banner.raffleId && typeof this.banner.raffleId === 'object') {
        const r = this.banner.raffleId;
        if (!this.raffles.find(x => x._id === r._id)) {
          this.raffles = [r, ...this.raffles];
        }
        this.raffleId = r._id;
      } else {
        this.raffleId = this.banner.raffleId || null;
      }
      
      this.linkUrl = this.banner.linkUrl || '';
    } else {
      this.title = '';
      this.raffleId = null;
      this.linkUrl = '';
    }
  }

  loadRaffles(reset = false) {
    if (reset) {
      this.rafflePage = 1;
      this.raffles = [];
      this.hasMoreRaffles = true;
    }
    
    if (!this.hasMoreRaffles || this.isLoadingRaffles) return;

    this.isLoadingRaffles = true;
    this.raffleService.getActive(this.rafflePage, 10, this.raffleSearchTerm, true).subscribe({
      next: (res) => {
        const data: any = res.data;
        let apiData = data?.result || data?.docs || data || [];
        const originalLength = apiData.length;
        
        let newData = [...apiData];
        if (reset && this.banner && this.banner.raffleId && typeof this.banner.raffleId === 'object') {
          const r = this.banner.raffleId;
          if (!newData.find((x: any) => x._id === r._id)) {
            newData = [r, ...newData];
          }
        }
        
        this.raffles = reset ? newData : [...this.raffles, ...newData];
        
        if (originalLength < 10) {
          this.hasMoreRaffles = false;
        } else {
          this.rafflePage++;
        }
        this.isLoadingRaffles = false;
      },
      error: (err) => {
        console.error('Error cargando rifas', err);
        this.isLoadingRaffles = false;
      }
    });
  }

  onRaffleScrollToEnd() {
    this.loadRaffles();
  }

  onRaffleSearch(term: {term: string}) {
    this.raffleSearchSubject.next(term.term);
  }

  onFileSelected(photo: Blob | File | string | null) {
    this.selectedFile = photo;
  }

  cambiarImagen() {
    this.isChangingImage = true;
  }

  isFormValid(): boolean {
    const titleLen = this.title.trim().length;
    const isValidTitle = titleLen >= 3 && titleLen <= 100;
    const hasImage = !!this.banner?.imageUrl || !!this.selectedFile;
    return isValidTitle && hasImage;
  }

  showConfirmModal = false;
  cambios: { campo: string; anterior: string | number; nuevo: string | number }[] = [];

  detectarCambios(): boolean {
    if (!this.banner) return false;
    this.cambios = [];

    const checkChange = (campo: string, anterior: unknown, nuevo: unknown) => {
      const normAnterior = (anterior === null || anterior === undefined) ? '' : String(anterior).trim();
      const normNuevo = (nuevo === null || nuevo === undefined) ? '' : String(nuevo).trim();
      if (normAnterior !== normNuevo) {
        this.cambios.push({ campo, anterior: normAnterior || '(Vacío)', nuevo: normNuevo || '(Vacío)' });
      }
    };

    checkChange('Título', this.banner.title, this.title.trim());
    
    const bannerRaffleId = this.banner.raffleId ? (this.banner.raffleId._id || this.banner.raffleId) : '';
    checkChange('ID Rifa', bannerRaffleId, this.raffleId || '');
    checkChange('Enlace', this.banner.linkUrl, this.linkUrl.trim());
    
    if (this.selectedFile) {
       this.cambios.push({ campo: 'Imagen', anterior: 'Actual', nuevo: 'Nueva Imagen' });
    }

    return this.cambios.length > 0;
  }

  onSaveClick() {
    if (!this.isFormValid() || this.isSaving) return;

    if (this.banner) {
       const hasChanges = this.detectarCambios();
       if (hasChanges) {
         this.showConfirmModal = true;
       } else {
         this.onSubmit();
       }
    } else {
       this.onSubmit();
     }
  }

  cancelConfirm() {
    this.showConfirmModal = false;
    this.cambios = [];
  }

  confirmSubmit() {
    this.showConfirmModal = false;
    this.onSubmit();
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSaving) return;

    const formData = new FormData();
    formData.append('title', this.title.trim());
    if (this.raffleId) {
      formData.append('raffleId', this.raffleId);
    } else {
      formData.append('raffleId', '');
    }
    formData.append('linkUrl', this.linkUrl.trim());
    
    if (this.selectedFile && (this.selectedFile instanceof File || this.selectedFile instanceof Blob)) {
      formData.append('banner', this.selectedFile);
    }

    this.save.emit(formData);
  }

  onModalClosed() {
    this.resetForm();
    this.closed.emit();
  }
}
