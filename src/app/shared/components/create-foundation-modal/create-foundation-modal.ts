import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Foundation } from '../../../core/interfaces/foundation.interface';



@Component({
  selector: 'app-create-foundation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-foundation-modal.html',
  styleUrl: './create-foundation-modal.scss',
})
export class CreateFoundationModal implements OnChanges {
  @Input() foundation: Foundation | null = null;
  @Output() save = new EventEmitter<Foundation>();

  nombre = '';
  descripcion = '';
  correo = '';
  telefono = '';
  photo = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['foundation']) {
      this.resetForm();
    }
  }

  resetForm() {
    if (this.foundation) {
      this.nombre = this.foundation.nombre || '';
      this.descripcion = this.foundation.descripcion || '';
      this.correo = this.foundation.correo || '';
      this.telefono = this.foundation.telefono || '';
      this.photo = this.foundation.photo || '';
    } else {
      this.nombre = '';
      this.descripcion = '';
      this.correo = '';
      this.telefono = '';
      this.photo = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.readFile(event.dataTransfer.files[0]);
    }
  }

  private readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.photo = reader.result as string;
    };
    reader.onerror = (error) => {
      console.error('CreateFoundationModal: Error al leer el archivo:', error);
    };
    reader.readAsDataURL(file);
  }

  isFormValid(): boolean {
    return (
      this.nombre.trim() !== '' &&
      this.descripcion.trim() !== '' &&
      this.correo.trim() !== '' &&
      this.telefono.trim() !== ''
    );
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const data: Foundation = {
      id: this.foundation?.id ?? 0,
      estado: this.foundation?.estado ?? 'ACTIVO',
      acciones: this.foundation?.acciones ?? '',
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      correo: this.correo.trim(),
      telefono: this.telefono.trim(),
      photo: this.photo,
    };

    this.save.emit(data);
  }
}
