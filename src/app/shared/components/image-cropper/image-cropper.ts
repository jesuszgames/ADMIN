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
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.scss',
})
export class ImageCropperComponent implements OnChanges {
  @Input() photo: string | Blob | File | null = null;
  @Input() isReadOnly = false;
  @Input() aspectRatio = '';
  @Output() photoChange = new EventEmitter<Blob | File | string | null>();

  @ViewChild('viewport', { static: false }) viewportElement!: ElementRef<HTMLDivElement>;
  @ViewChild('editImage', { static: false }) editImageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('fileInput', { static: false }) fileInputElement!: ElementRef<HTMLInputElement>;

  originalPhoto = '';
  tempImageSrc = '';
  previewUrl = '';
  isEditing = false;
  errorMessage = '';
  successMessage = '';
  pendingFileToCompress: File | null = null;
  isCompressing = false;

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
      this.successMessage = '';
      if (!this.photo) {
        this.originalPhoto = '';
        this.tempImageSrc = '';
        this.previewUrl = '';
        this.isEditing = false;
        this.pendingFileToCompress = null;
        this.isCompressing = false;
        if (this.fileInputElement) {
          this.fileInputElement.nativeElement.value = '';
        }
      } else {
        if (typeof this.photo === 'string') {
          if (this.photo.startsWith('http') || this.photo.startsWith('data:')) {
            this.previewUrl = this.photo;
          } else {
            try {
              const origin = new URL(environment.apiUrl).origin;
              if (this.photo.startsWith('/')) {
                this.previewUrl = origin + this.photo;
              } else {
                this.previewUrl = `${origin}/v1/api/public/uploads/raffle/${this.photo}`;
              }
            } catch (e) {
              this.previewUrl = this.photo;
            }
          }
        } else {
          if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.previewUrl);
          }
          this.previewUrl = URL.createObjectURL(this.photo);
        }

        if (!this.isEditing) {
          this.originalPhoto = this.previewUrl;
          this.tempImageSrc = this.previewUrl;
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
    this.successMessage = '';
    this.pendingFileToCompress = null;
    const maxSizeBytes = 800 * 1024;
    if (file.size > maxSizeBytes) {
      this.isCompressing = true;
      this.compressImage(file)
        .then((compressedBlob) => {
          this.isCompressing = false;
          if (compressedBlob.size > maxSizeBytes) {
            this.errorMessage =
              'No se pudo comprimir el archivo por debajo de 800 KB. Por favor, elige otra imagen.';
            return;
          }
          this.loadPhotoIntoCropper(compressedBlob);
          this.successMessage = 'Imagen optimizada automáticamente a menos de 800 KB.';
          setTimeout(() => {
            this.successMessage = '';
          }, 4000);
        })
        .catch((error) => {
          this.isCompressing = false;
          this.errorMessage = 'Error al procesar y comprimir la imagen: ' + error.message;
        });

      if (this.fileInputElement) {
        this.fileInputElement.nativeElement.value = '';
      }
      return;
    }

    this.loadPhotoIntoCropper(file);
  }

  private loadPhotoIntoCropper(file: Blob | File) {
    if (this.tempImageSrc && this.tempImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(this.tempImageSrc);
    }

    this.originalPhoto = URL.createObjectURL(file);
    this.tempImageSrc = this.originalPhoto;
    this.isEditing = true;
    this.pendingFileToCompress = null;
  }

  compressPendingFile() {
    if (!this.pendingFileToCompress) return;
    this.isCompressing = true;
    this.errorMessage = '';

    this.compressImage(this.pendingFileToCompress)
      .then((compressedBlob) => {
        this.isCompressing = false;
        const maxSizeBytes = 800 * 1024;
        if (compressedBlob.size > maxSizeBytes) {
          this.errorMessage =
            'No se pudo comprimir el archivo por debajo de 800 KB. Por favor, elige otra imagen.';
          this.pendingFileToCompress = null;
          return;
        }
        this.loadPhotoIntoCropper(compressedBlob);
      })
      .catch((error) => {
        this.isCompressing = false;
        this.errorMessage = 'Error al procesar y comprimir la imagen: ' + error.message;
        this.pendingFileToCompress = null;
      });
  }

  private compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDimension = 1600;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Error al generar el archivo comprimido.'));
                }
              },
              'image/webp',
              0.9,
            );
          } else {
            reject(new Error('No se pudo inicializar el motor de compresión.'));
          }
        };
        img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error de lectura del archivo.'));
      reader.readAsDataURL(file);
    });
  }

  startEditing() {
    if (this.isReadOnly || !this.photo) return;
    this.tempImageSrc = this.originalPhoto;
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.tempImageSrc = '';
    this.pendingFileToCompress = null;
    this.isCompressing = false;
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
        const scale = Math.min(
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
    const imageWidth = this.baseWidth * this.zoom;
    if (imageWidth < this.viewportWidth) {
      this.imgLeft = (this.viewportWidth - imageWidth) / 2;
    } else {
      const minLeft = this.viewportWidth - imageWidth;
      const maxLeft = 0;
      this.imgLeft = Math.max(minLeft, Math.min(maxLeft, this.imgLeft));
    }

    const imageHeight = this.baseHeight * this.zoom;
    if (imageHeight < this.viewportHeight) {
      this.imgTop = (this.viewportHeight - imageHeight) / 2;
    } else {
      const minTop = this.viewportHeight - imageHeight;
      const maxTop = 0;
      this.imgTop = Math.max(minTop, Math.min(maxTop, this.imgTop));
    }
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

    const canvasWidth = Math.min(sw, 1200);
    const canvasHeight = canvasWidth * (this.viewportHeight / this.viewportWidth);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(this.previewUrl);
            }
            const blobUrl = URL.createObjectURL(blob);
            this.photo = blob;
            this.previewUrl = blobUrl;
            this.photoChange.emit(blob);

            this.originalPhoto = blobUrl;
            this.tempImageSrc = blobUrl;
          }
        },
        'image/webp',
        0.85,
      );
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
