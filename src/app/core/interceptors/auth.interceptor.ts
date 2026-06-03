import { HttpInterceptorFn } from '@angular/common/http';
import { SESSION_STORAGE_KEY_TOKEN } from '../helpers/global/auth.constants';

const HEADER_API_KEY = 'x-api-key';
const HEADER_AUTHORIZATION = 'Authorization';
const BEARER_PREFIX = 'Bearer ';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem(SESSION_STORAGE_KEY_TOKEN);
    }
  } catch (e) {
    console.warn('authInterceptor: LocalStorage access block.', e);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        [HEADER_API_KEY]: token,
        [HEADER_AUTHORIZATION]: `${BEARER_PREFIX}${token}`
      },
    });
    return next(authReq);
  }

  return next(req);
};

