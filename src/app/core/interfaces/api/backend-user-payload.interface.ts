import {
  BACKEND_ROLE_ADMIN,
  BACKEND_ROLE_PLAYER,
  BACKEND_ROLE_SORT,
  BACKEND_STATUS_ACTIVE,
  BACKEND_STATUS_DELETED,
  BACKEND_STATUS_INACTIVE,
} from '../../helpers/global/auth.constants';

export interface BackendUserPayload {
  _id?: string;
  username?: string;
  password?: string;
  role?: (typeof BACKEND_ROLE_ADMIN | typeof BACKEND_ROLE_SORT | typeof BACKEND_ROLE_PLAYER)[];
  name?: string;
  email?: string;
  phone?: string;
  status?: typeof BACKEND_STATUS_ACTIVE | typeof BACKEND_STATUS_INACTIVE | typeof BACKEND_STATUS_DELETED;
  [key: string]: unknown;
}
