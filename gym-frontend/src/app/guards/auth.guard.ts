import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/** El rol CLIENTE usa el Punto de Venta (/tienda) en lugar del módulo Productos. */
export const noClienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.obtenerRol() === 'CLIENTE') {
    router.navigate(['/tienda']);
    return false;
  }
  return true;
};
