import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from '../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from './global-constants';

import { Category, IconOption } from '../../interfaces/category.interface';


export const AVAILABLE_CATEGORIES_ICONS: IconOption[] = [
  { value: 'bi-tux', label: 'Pingüino (Animales)' },
  { value: 'bi-plus-square', label: 'Cruz (Salud)' },
  { value: 'bi-mortarboard', label: 'Birrete (Educación)' },
  { value: 'bi-leaf', label: 'Hoja (Medio Ambiente)' },
  { value: 'bi-heart', label: 'Corazón (Asistencia Social)' },
  { value: 'bi-cpu', label: 'Microchip (Tecnología)' },
  { value: 'bi-trophy', label: 'Trofeo (Deportes)' },
  { value: 'bi-palette', label: 'Paleta (Cultura y Arte)' },
  { value: 'bi-music-note-beamed', label: 'Nota Musical (Música)' },
];

export const CATEGORIES_PRINCIPAL_HEADER = 'Categorias';

export const CATEGORIES_COLUMNS: TableColumn[] = [
  { field: 'nombre', header: 'NOMBRE', type: 'icon-text' },
  { field: 'descripcion', header: 'DESCRIPCION' },
  { field: 'estado', header: 'ESTADO', type: 'badge' },
  { field: 'acciones', header: 'ACCIONES', type: 'actions' },
];

export const CATEGORY_FILTER_ALL = 'all';
export const CATEGORY_FILTER_INACTIVE = 'desactivados';
export const CATEGORY_FILTER_DELETE = 'eliminados';

export const MY_CATEGORIES_FILTERS: FilterOption[] = [
  { id: CATEGORY_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: CATEGORY_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivadas' },
  { id: CATEGORY_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminadas' },
];

export const CATEGORY_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi-pencil-square', label: 'Editar Categoría' },
  { id: TABLE_ACTION_CHANGE_STATE, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: TABLE_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const MY_CATEGORIES_DATA_MOCK: Category[] = [
  {
    id: 1,
    nombre: 'ANIMALES',
    descripcion: 'Gestión de especies, refugios y programas de adopción animal.',
    icon: 'bi-tux',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 2,
    nombre: 'SALUD',
    descripcion: 'Proyectos destinados a la prevención y tratamiento de enfermedades.',
    icon: 'bi-plus-square',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 3,
    nombre: 'EDUCACION',
    descripcion: 'Fomento del aprendizaje y apoyo a instituciones académicas.',
    icon: 'bi-mortarboard',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 4,
    nombre: 'MEDIO AMBIENTE',
    descripcion: 'Iniciativas de conservación, reciclaje y cuidado del ecosistema.',
    icon: 'bi-leaf',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 5,
    nombre: 'ASISTENCIA SOCIAL',
    descripcion: 'Apoyo comunitario, atención a grupos vulnerables y bienestar social.',
    icon: 'bi-heart',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 6,
    nombre: 'TECNOLOGIA',
    descripcion: 'Soluciones digitales, innovación técnica',
    icon: 'bi-cpu',
    estado: 'DESACTIVADO',
    acciones: '',
  },
  {
    id: 7,
    nombre: 'DEPORTES',
    descripcion: 'Programas de fomento deportivo y vida saludable.',
    icon: 'bi-trophy',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 8,
    nombre: 'CULTURA Y ARTE',
    descripcion: 'Eventos culturales, talleres artísticos y conservación de tradiciones.',
    icon: 'bi-palette',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 9,
    nombre: 'CIENCIA',
    descripcion: 'Proyectos de investigación científica y desarrollo experimental.',
    icon: 'bi-virus',
    estado: 'ELIMINADO',
    acciones: '',
  },
  {
    id: 10,
    nombre: 'MUSICA',
    descripcion: 'Talleres de formación musical y bandas juveniles.',
    icon: 'bi-music-note-beamed',
    estado: 'ACTIVO',
    acciones: '',
  },
];
