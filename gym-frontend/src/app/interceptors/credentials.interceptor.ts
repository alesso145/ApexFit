import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('gym_token');
  const requestWithCredentials = req.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return next(requestWithCredentials);
};
