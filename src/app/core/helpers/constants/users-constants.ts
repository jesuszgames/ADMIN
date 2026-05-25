import { TableColumn } from '../../../shared/components/tables/tables';
import { FilterOption } from '../../../shared/components/filter/filter';
import { DropdownAction } from '../../../shared/components/dropdown/dropdown';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: 'ACTIVO' | 'INACTIVO';
  acciones: string;
  [key: string]: unknown;
}

export const USERS_PRINCIPAL_HEADER = 'Lista Usuarios';

export const USERS_COLUMNS: TableColumn[] = [
  { field: 'nombre', header: 'NOMBRE RIFA' },
  { field: 'correo', header: 'Correo' },
  { field: 'telefono', header: 'Telefono' },
  { field: 'estado', header: 'ESTADO', type: 'badge' },
  { field: 'acciones', header: 'ACCIONES', type: 'actions' },
];

export const USER_STATUS_ACTIVE = 'ACTIVO';
export const USER_STATUS_INACTIVE = 'INACTIVO';

export const USER_FILTER_ALL = 'all';
export const USER_FILTER_INACTIVE = 'desactivado';

export const USER_ACTION_EDIT = 1;
export const USER_ACTION_TOGGLE_STATUS = 2;
export const USER_ACTION_DELETE = 3;

export const USERS_FILTERS: FilterOption[] = [
  { id: USER_FILTER_ALL, icon: 'bi-list-ul', label: 'Todo' },
  { id: USER_FILTER_INACTIVE, icon: 'bi-eye-slash', label: 'Desactivadas' },
];

export const USER_ROW_ACTIONS: DropdownAction[] = [
  { id: USER_ACTION_EDIT, icon: 'bi-pencil-square', label: 'Editar' },
  { id: USER_ACTION_TOGGLE_STATUS, icon: 'bi-arrow-repeat', label: 'Cambiar Estado' },
  { id: USER_ACTION_DELETE, icon: 'bi-trash', label: 'Eliminar' },
];

export const USERS_DATA_MOCK: User[] = [
  {
    id: 1,
    nombre: 'Paco Macias',
    correo: 'paco@example.com',
    telefono: '0988769242',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 2,
    nombre: 'Mero Paco',
    correo: 'mero@example.com',
    telefono: '0988767842',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 3,
    nombre: 'Jojis Jostar',
    correo: 'pose@example.com',
    telefono: '0988767842',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 4,
    nombre: 'Mero Calor',
    correo: 'si@example.com',
    telefono: '0996767842',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 5,
    nombre: 'Oscar Perez',
    correo: 'no@example.com',
    telefono: '0996767842',
    estado: 'INACTIVO',
    acciones: '',
  },
  {
    id: 6,
    nombre: 'Ana Gomez',
    correo: 'ana@example.com',
    telefono: '0998765432',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 7,
    nombre: 'Luis Martinez',
    correo: 'luis@example.com',
    telefono: '0991234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 8,
    nombre: 'Sofia Rodriguez',
    correo: 'sofia@example.com',
    telefono: '0987654321',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 9,
    nombre: 'Juan Lopez',
    correo: 'juan@example.com',
    telefono: '0971234567',
    estado: 'INACTIVO',
    acciones: '',
  },
  {
    id: 10,
    nombre: 'Maria Silva',
    correo: 'maria@example.com',
    telefono: '0961234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 11,
    nombre: 'Pedro Diaz',
    correo: 'pedro@example.com',
    telefono: '0951234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 12,
    nombre: 'Lucia Santos',
    correo: 'lucia@example.com',
    telefono: '0941234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 13,
    nombre: 'Diego Torres',
    correo: 'diego@example.com',
    telefono: '0931234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 14,
    nombre: 'Elena Ruiz',
    correo: 'elena@example.com',
    telefono: '0921234567',
    estado: 'INACTIVO',
    acciones: '',
  },
  {
    id: 15,
    nombre: 'Carlos Cruz',
    correo: 'carlos@example.com',
    telefono: '0911234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 16,
    nombre: 'Marta Ortiz',
    correo: 'marta@example.com',
    telefono: '0901234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 17,
    nombre: 'Jose Ramos',
    correo: 'jose@example.com',
    telefono: '0891234567',
    estado: 'ACTIVO',
    acciones: '',
  },
  {
    id: 18,
    nombre: 'Laura Castro',
    correo: 'laura@example.com',
    telefono: '0881234567',
    estado: 'ACTIVO',
    acciones: '',
  },
];
