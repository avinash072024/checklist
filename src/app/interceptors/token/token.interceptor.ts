import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Constants } from '../../models/constants';
import { SessionService } from '../../services/session/session.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const token = sessionService.getCookie(Constants.token);

  if (!token) {
    return next(req);
  }
  
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
