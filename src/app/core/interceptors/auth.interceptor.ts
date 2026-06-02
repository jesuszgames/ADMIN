import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }
  } catch (e) {
    console.warn('authInterceptor: LocalStorage access block.', e);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        'x-api-key': token,
        'Authorization': `Bearer ${token}`
      },
    });
    return next(authReq);
  }

  return next(req);
};
