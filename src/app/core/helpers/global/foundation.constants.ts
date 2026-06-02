import { FilterOption } from '../../../shared/components/filter/filter';
import { TableColumn } from '../../../shared/components/tables/tables';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';
import {
  TABLE_ACTION_CHANGE_STATE,
  TABLE_ACTION_DELETE,
  TABLE_ACTION_EDIT_DETAIL,
} from '../ui/constants';

import { Foundation } from '../../interfaces/api/foundation.interface';

export const STATE_ACTIVE = 'ACTIVE';
export const STATE_INACTIVE = 'INACTIVE';
export const STATE_DELETED = 'DELETED';

export const MY_FOUNDATIONS_PRINCIPAL_HEADER = 'Fundaciones';

export const MY_FOUNDATIONS_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE FUNDACION' },
  { field: 'description', header: 'DESCRIPCION' },
  { field: 'email', header: 'CORREO' },
  { field: 'phone', header: 'TELEFONO' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
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
    _id: '603d21bf9f8b2c001f8ee3f1',
    name: 'Manos Unidas contra las discapacidades',
    description:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem.',
    email: 'lorem@example.com',
    phone: '0988769242',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f2',
    name: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    description:
      'Pulvinar vivamus fringilla lacus nec metus bibendum egestas, iaculis massa nisl malesuada lacinia integer nunc posuere.',
    email: 'ipsum@example.com',
    phone: '0988769242',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f3',
    name: 'Ad litora torquent per conubia nostra inceptos himenaeos.',
    description:
      'empus leo au aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.',
    email: 'litora@example.com',
    phone: '0988769242',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f4',
    name: 'Ut hendrerit semper vel class aptent taciti sociosqu',
    description:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque aptent taciti sociosqu sem placerat.',
    email: 'hendredit@example.com',
    phone: '0988769242',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f5',
    name: 'empus leo au aenean sed diam urna tempor.',
    description:
      'empus leo au aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.',
    email: 'empusco@example.com',
    phone: '0988769242',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f6',
    name: 't hendrerit semper vel class aptent taciti sociosqu.',
    description:
      'Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
    email: 'pacoso@example.com',
    phone: '0988769242',
    status: 'INACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f7',
    name: 'Banco de Alimentos',
    description: 'Distribución de despensas a familias vulnerables.',
    email: 'alimentos@example.com',
    phone: '0991234567',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f8',
    name: 'Unicef',
    description: 'Ayuda humanitaria y desarrollo para niños a nivel mundial.',
    email: 'unicef@example.com',
    phone: '0987654321',
    status: 'ACTIVE',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3f9',
    name: 'Amigos de los Animales',
    description: 'Refugio y adopción para perros and gatos de la calle.',
    email: 'animales@example.com',
    phone: '0971234567',
    status: 'DELETED',
    actions: '',
    deleteReason: 'La fundación cesó operaciones en la localidad',
  },
  {
    _id: '603d21bf9f8b2c001f8ee3fa',
    name: 'Fundación Teletón',
    description: 'Rehabilitación para niños con discapacidad neuromotora.',
    email: 'teleton@example.com',
    phone: '0961234567',
    status: 'ACTIVE',
    actions: '',
  },
];
