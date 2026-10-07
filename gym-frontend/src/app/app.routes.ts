import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { EntrenadoresComponent } from './components/entrenadores/entrenadores.component';
import { MembresiasComponent } from './components/membresias/membresias.component';
import { InscripcionesComponent } from './components/inscripciones/inscripciones.component';
import { ClasesComponent } from './components/clases/clases.component';
import { AsistenciasComponent } from './components/asistencias/asistencias.component';
import { AsistenciaEntrenadoresComponent } from './components/asistencia-entrenadores/asistencia-entrenadores.component';
import { ProductosComponent } from './components/productos/productos.component';
import { TiendaComponent } from './components/tienda/tienda.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { CuentaComponent } from './components/cuenta/cuenta.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard, noClienteGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent },
  { path: 'clientes', canActivate: [authGuard], component: ClientesComponent },
  { path: 'entrenadores', canActivate: [authGuard], component: EntrenadoresComponent },
  { path: 'membresias', canActivate: [authGuard], component: MembresiasComponent },
  { path: 'inscripciones', canActivate: [authGuard], component: InscripcionesComponent },
  { path: 'clases', canActivate: [authGuard], component: ClasesComponent },
  { path: 'asistencias', canActivate: [authGuard], component: AsistenciasComponent },
  { path: 'asistencias-entrenadores', canActivate: [authGuard], component: AsistenciaEntrenadoresComponent },
  { path: 'productos', canActivate: [authGuard, noClienteGuard], component: ProductosComponent },
  { path: 'tienda', canActivate: [authGuard], component: TiendaComponent },
  { path: 'pagos', canActivate: [authGuard], component: PagosComponent },
  { path: 'cuenta', canActivate: [authGuard], component: CuentaComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
