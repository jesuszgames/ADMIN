import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from './../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from './global-constants';

export interface Foundation {
  id: number;
  nombre: string;
  descripcion: string;
  correo: string;
  telefono: string;
  estado: string;
  acciones: string;
  [key: string]: unknown;
}

export const MY_FOUNDATIONS_PRINCIPAL_HEADER = 'Fundaciones';

export const MY_FOUNDATIONS_COLUMNS: TableColumn[] = [
  { field: 'nombre', header: 'NOMBRE FUNDACION' },
  { field: 'descripcion', header: 'DESCRIPCION' },
  { field: 'correo', header: 'CORREO' },
  { field: 'telefono', header: 'TELEFONO' },
  { field: 'estado', header: 'ESTADO', type: 'badge' },
  { field: 'acciones', header: 'ACCIONES', type: 'actions' },
];

export const FOUNDATION_FILTER_ALL = 'all';
export const FOUNDATION_FILTER_INACTIVE = 'desactivados';
export const FOUNDATION_FILTER_DELETE = 'eliminados';

export const FOUNDATION_FILTERS: FilterOption[] = [
  { id: FOUNDATION_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: FOUNDATION_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivadas' },
  { id: FOUNDATION_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminados' },
];

export const FOUNDATION_ROW_ACTIONS: DropdownAction[] = [
  { id: TABLE_ACTION_EDIT_DETAIL, icon: 'bi-pencil-square', label: 'Editar Fundación' },
  { id: TABLE_ACTION_CHANGE_STATE, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: TABLE_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const MY_FOUNDATIONS_DATA_MOCK: Foundation[] = [
  {
    id: 1,
    nombre: 'Manos Unidas contra las discapacidades',
    descripcion: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem.',
    correo: 'lorem@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 2,
    nombre: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    descripcion: 'Pulvinar vivamus fringilla lacus nec metus bibendum egestas, iaculis massa nisl malesuada lacinia integer nunc posuere.',
    correo: 'ipsum@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 3,
    nombre: 'Ad litora torquent per conubia nostra inceptos himenaeos.',
    descripcion: 'empus leo au aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.',
    correo: 'litora@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 4,
    nombre: 'Ut hendrerit semper vel class aptent taciti sociosqu',
    descripcion: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque aptent taciti sociosqu sem placerat.',
    correo: 'hendredit@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 5,
    nombre: 'empus leo au aenean sed diam urna tempor.',
    descripcion: 'empus leo au aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.',
    correo: 'empusco@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 6,
    nombre: 't hendrerit semper vel class aptent taciti sociosqu.',
    descripcion: 'Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
    correo: 'pacoso@example.com',
    telefono: '0988769242',
    estado: 'DESACTIVADO',
    acciones: '',
  },
  {
    id: 7,
    nombre: 'Banco de Alimentos',
    descripcion: 'Distribución de despensas a familias vulnerables.',
    correo: 'alimentos@example.com',
    telefono: '0991234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 8,
    nombre: 'Unicef',
    descripcion: 'Ayuda humanitaria y desarrollo para niños a nivel mundial.',
    correo: 'unicef@example.com',
    telefono: '0987654321',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 9,
    nombre: 'Amigos de los Animales',
    descripcion: 'Refugio y adopción para perros y gatos de la calle.',
    correo: 'animales@example.com',
    telefono: '0971234567',
    estado: 'ELIMINADO',
    acciones: '',
  },
  {
    id: 10,
    nombre: 'Fundación Teletón',
    descripcion: 'Rehabilitación para niños con discapacidad neuromotora.',
    correo: 'teleton@example.com',
    telefono: '0961234567',
    estado: 'ACTIVO',
    acciones: '',
  },
];
