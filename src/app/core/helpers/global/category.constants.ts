import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from '../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../ui/constants';

import { Category, IconOption } from '../../interfaces/api/category.interface';

export const STATE_ACTIVE = 'ACTIVE';
export const STATE_INACTIVE = 'INACTIVE';
export const STATE_DELETED = 'DELETED';

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
  { value: 'bi-house-heart', label: 'Casa con Corazón (Hogar/Vivienda)' },
  { value: 'bi-car-front', label: 'Automóvil (Transporte)' },
  { value: 'bi-gift', label: 'Regalo (Premios/Sorteos)' },
  { value: 'bi-cash-coin', label: 'Monedas (Economía/Finanzas)' },
  { value: 'bi-shield-shaded', label: 'Escudo (Seguridad)' },
  { value: 'bi-tools', label: 'Herramientas (Servicios/Mantenimiento)' },
  { value: 'bi-book', label: 'Libro Abierto (Lectura/Cultura)' },
  { value: 'bi-camera', label: 'Cámara (Fotografía/Medios)' },
  { value: 'bi-globe', label: 'Globo Terráqueo (Internacional/Comunidad)' },
  { value: 'bi-shop', label: 'Tienda (Comercio Local)' },
  { value: 'bi-bicycle', label: 'Bicicleta (Movilidad/Salud)' },
  { value: 'bi-sun', label: 'Sol (Energía/Clima)' },
];

export const CATEGORIES_PRINCIPAL_HEADER = 'Categorias';

export const CATEGORIES_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE', type: 'icon-text' },
  { field: 'description', header: 'DESCRIPCION' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
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
    _id: '603d21bf9f8b2c001f8ee3c1',
    name: 'ANIMALES',
    description: 'Gestión de especies, refugios y programas de adopción animal.',
    icon: 'bi-tux',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c2',
    name: 'SALUD',
    description: 'Proyectos destinados a la prevención y tratamiento de enfermedades.',
    icon: 'bi-plus-square',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c3',
    name: 'EDUCACION',
    description: 'Fomento del aprendizaje and apoyo a instituciones académicas.',
    icon: 'bi-mortarboard',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c4',
    name: 'MEDIO AMBIENTE',
    description: 'Iniciativas de conservación, reciclaje y cuidado del ecosistema.',
    icon: 'bi-leaf',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c5',
    name: 'ASISTENCIA SOCIAL',
    description: 'Apoyo comunitario, atención a grupos vulnerables y bienestar social.',
    icon: 'bi-heart',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c6',
    name: 'TECNOLOGIA',
    description: 'Soluciones digitales, innovación técnica',
    icon: 'bi-cpu',
    status: 'INACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c7',
    name: 'DEPORTES',
    description: 'Programas de fomento deportivo y vida saludable.',
    icon: 'bi-trophy',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c8',
    name: 'CULTURA Y ARTE',
    description: 'Eventos culturales, talleres artísticos y conservación de tradiciones.',
    icon: 'bi-palette',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3c9',
    name: 'CIENCIA',
    description: 'Proyectos de investigación científica y desarrollo experimental.',
    icon: 'bi-virus',
    status: 'DELETED',
    actions: '',
    deleteReason: 'Falta de patrocinio y recursos asignados',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3ca',
    name: 'MUSICA',
    description: 'Talleres de formación musical y bandas juveniles.',
    icon: 'bi-music-note-beamed',
    status: 'ACTIVE',
    actions: '',
  },
];
