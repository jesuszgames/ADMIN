import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.scss',
})
export class ImageCropperComponent implements OnChanges {
  @Input() photo = '';
  @Input() isReadOnly = false;
  @Output() photoChange = new EventEmitter<string>();

  @ViewChild('viewport', { static: false }) viewportElement!: ElementRef<HTMLDivElement>;
  @ViewChild('editImage', { static: false }) editImageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef<HTMLInputElement>;

  originalPhoto = '';
  tempImageSrc = '';
  isEditing = false;
  errorMessage = '';

  viewportWidth = 0;
  viewportHeight = 0;

  baseWidth = 0;
  baseHeight = 0;
  imgLeft = 0;
  imgTop = 0;
  zoom = 1.0;

  isDragging = false;
  startX = 0;
  startY = 0;
  lastImgLeft = 0;
  lastImgTop = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photo']) {
      this.errorMessage = '';
      if (!this.photo) {
        this.originalPhoto = '';
        this.tempImageSrc = '';
        this.isEditing = false;
        if (this.fileInputElement) {
          this.fileInputElement.nativeElement.value = '';
        }
      } else if (!this.isEditing) {
        if (!this.originalPhoto || this.photo !== this.tempImageSrc) {
          this.originalPhoto = this.photo;
        }
      }
    }
  }

  onFileSelected(event: Event) {
    if (this.isReadOnly) return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    if (this.isReadOnly) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    if (this.isReadOnly) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  private readFile(file: File) {
    this.errorMessage = '';
    const maxSizeBytes = 500 * 1024;
    if (file.size > maxSizeBytes) {
      this.errorMessage = 'El archivo supera el tamaño máximo permitido de 500 KB.';
      if (this.fileInputElement) {
        this.fileInputElement.nativeElement.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.originalPhoto = reader.result as string;
      this.tempImageSrc = this.originalPhoto;
      this.isEditing = true;
    };
    reader.onerror = (error) => {
      console.error('ImageCropperComponent: Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file);
  }

  startEditing() {
    if (this.isReadOnly || !this.photo) return;
    this.tempImageSrc = this.originalPhoto || this.photo;
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.tempImageSrc = '';
    if (this.fileInputElement) {
      this.fileInputElement.nativeElement.value = '';
    }
  }

  onImageLoaded() {
    setTimeout(() => {
      if (!this.viewportElement || !this.editImageElement) return;

      this.updateViewportSize();
      const image = this.editImageElement.nativeElement;

      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      if (naturalWidth && naturalHeight && this.viewportWidth && this.viewportHeight) {
        const scale = Math.max(
          this.viewportWidth / naturalWidth,
          this.viewportHeight / naturalHeight,
        );
        this.baseWidth = naturalWidth * scale;
        this.baseHeight = naturalHeight * scale;

        this.imgLeft = (this.viewportWidth - this.baseWidth) / 2;
        this.imgTop = (this.viewportHeight - this.baseHeight) / 2;
        this.lastImgLeft = this.imgLeft;
        this.lastImgTop = this.imgTop;
        this.zoom = 1.0;
      }
    }, 50);
  }

  private updateViewportSize() {
    if (this.viewportElement) {
      const rect = this.viewportElement.nativeElement.getBoundingClientRect();
      this.viewportWidth = rect.width || this.viewportElement.nativeElement.offsetWidth || 300;
      this.viewportHeight = rect.height || this.viewportElement.nativeElement.offsetHeight || 250;
    }
  }

  onMouseDown(event: MouseEvent) {
    if (this.isReadOnly) return;
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.updateViewportSize();
    this.lastImgLeft = this.imgLeft;
    this.lastImgTop = this.imgTop;
  }

  onTouchStart(event: TouchEvent) {
    if (this.isReadOnly) return;
    if (event.touches.length > 0) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
      this.updateViewportSize();
      this.lastImgLeft = this.imgLeft;
      this.lastImgTop = this.imgTop;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.drag(event.clientX, event.clientY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onWindowTouchMove(event: TouchEvent) {
    if (this.isDragging && event.touches.length > 0) {
      event.preventDefault();
      this.drag(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp() {
    this.isDragging = false;
  }

  @HostListener('window:touchend')
  onWindowTouchEnd() {
    this.isDragging = false;
  }

  private drag(clientX: number, clientY: number) {
    const dx = clientX - this.startX;
    const dy = clientY - this.startY;
    this.imgLeft = this.lastImgLeft + dx;
    this.imgTop = this.lastImgTop + dy;
    this.constrainBounds();
  }

  private constrainBounds() {
    const maxLeft = 0;
    const minLeft = this.viewportWidth - this.baseWidth * this.zoom;
    this.imgLeft = Math.max(minLeft, Math.min(maxLeft, this.imgLeft));

    const maxTop = 0;
    const minTop = this.viewportHeight - this.baseHeight * this.zoom;
    this.imgTop = Math.max(minTop, Math.min(maxTop, this.imgTop));
  }

  onZoomChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newZoom = parseFloat(input.value);
    this.updateViewportSize();
    this.adjustZoom(newZoom);
  }

  private adjustZoom(newZoom: number) {
    const oldZoom = this.zoom;
    this.zoom = newZoom;

    const x = this.viewportWidth / 2;
    const y = this.viewportHeight / 2;

    const imageX = (x - this.imgLeft) / oldZoom;
    const imageY = (y - this.imgTop) / oldZoom;

    this.imgLeft = x - imageX * newZoom;
    this.imgTop = y - imageY * newZoom;

    this.constrainBounds();
  }

  cropImage() {
    if (!this.editImageElement) return;

    this.updateViewportSize();
    const image = this.editImageElement.nativeElement;
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    if (!naturalWidth || !naturalHeight) return;

    const totalScale = (this.baseWidth * this.zoom) / naturalWidth;

    const sx = -this.imgLeft / totalScale;
    const sy = -this.imgTop / totalScale;
    const sw = this.viewportWidth / totalScale;
    const sh = this.viewportHeight / totalScale;

    const canvasWidth = Math.min(sw, 500);
    const canvasHeight = canvasWidth * (this.viewportHeight / this.viewportWidth);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.7);

      this.photo = croppedBase64;
      this.photoChange.emit(croppedBase64);
    }

    this.isEditing = false;
    this.tempImageSrc = '';

    if (this.fileInputElement) {
      this.fileInputElement.nativeElement.value = '';
    }
  }

  triggerFileInput() {
    if (this.isReadOnly) return;
    this.fileInputElement?.nativeElement.click();
  }
}
