import { TableColumn } from '../../../shared/components/tables/tables';
import { FilterOption } from '../../../shared/components/filter/filter';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';

import { User } from '../../interfaces/api/user.interface';

export const USERS_PRINCIPAL_HEADER = 'Lista Usuarios';

export const USERS_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'NOMBRE USUARIO' },
  { field: 'email', header: 'Correo' },
  { field: 'phone', header: 'Telefono' },
  { field: 'role', header: 'ROL' },
  { field: 'status', header: 'ESTADO', type: 'badge' },
  { field: 'actions', header: 'ACCIONES', type: 'actions' },
];

export const USER_STATUS_ACTIVE = 'ACTIVO';
export const USER_STATUS_INACTIVE = 'INACTIVO';
export const STATE_DELETED = 'ELIMINADO';

export const USER_FILTER_ALL = 'all';
export const USER_FILTER_INACTIVE = 'desactivado';
export const USER_FILTER_DELETE = 'eliminados';

export const USER_ACTION_EDIT = 1;
export const USER_ACTION_TOGGLE_STATUS = 2;
export const USER_ACTION_DELETE = 3;

export const USERS_FILTERS: FilterOption[] = [
  { id: USER_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: USER_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivados' },
  { id: USER_FILTER_DELETE, icon: 'bi-trash', label: 'Eliminados' },
];

export const USER_ROW_ACTIONS: DropdownAction[] = [
  { id: USER_ACTION_EDIT, icon: 'bi-pencil-square', label: 'Editar' },
  { id: USER_ACTION_TOGGLE_STATUS, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: USER_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const USERS_DATA_MOCK: User[] = [
  {
    _id: '603d21bf9f8b2c001f8ee301',
    name: 'Paco Macias',
    email: 'paco@example.com',
    phone: '0988769242',
    status: 'ACTIVO',
    role: 'ADMIN',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee302',
    name: 'Mero Paco',
    email: 'mero@example.com',
    phone: '0988767842',
    status: 'ACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee303',
    name: 'Jojis Jostar',
    email: 'pose@example.com',
    phone: '0988767842',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee304',
    name: 'Mero Calor',
    email: 'si@example.com',
    phone: '0996767842',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee305',
    name: 'Oscar Perez',
    email: 'no@example.com',
    phone: '0996767842',
    status: 'INACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee306',
    name: 'Ana Gomez',
    email: 'ana@example.com',
    phone: '0998765432',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee307',
    name: 'Luis Martinez',
    email: 'luis@example.com',
    phone: '0991234567',
    status: 'ACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee308',
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    phone: '0987654321',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee309',
    name: 'Juan Lopez',
    email: 'juan@example.com',
    phone: '0971234567',
    status: 'INACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30a',
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '0961234567',
    status: 'ACTIVO',
    role: 'ADMIN',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30b',
    name: 'Pedro Diaz',
    email: 'pedro@example.com',
    phone: '0951234567',
    status: 'ACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30c',
    name: 'Lucia Santos',
    email: 'lucia@example.com',
    phone: '0941234567',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30d',
    name: 'Diego Torres',
    email: 'diego@example.com',
    phone: '0931234567',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30e',
    name: 'Elena Ruiz',
    email: 'elena@example.com',
    phone: '0921234567',
    status: 'INACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee30f',
    name: 'Carlos Cruz',
    email: 'carlos@example.com',
    phone: '0911234567',
    status: 'ACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee310',
    name: 'Marta Ortiz',
    email: 'marta@example.com',
    phone: '0901234567',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee311',
    name: 'Jose Ramos',
    email: 'jose@example.com',
    phone: '0891234567',
    status: 'ACTIVO',
    role: 'USUARIO',
    actions: '',
  },
  {
    _id: '603d21bf9f8b2c001f8ee312',
    name: 'Laura Castro',
    email: 'laura@example.com',
    phone: '0881234567',
    status: 'ACTIVO',
    role: 'SORTEADOR',
    actions: '',
  },
];
