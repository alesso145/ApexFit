import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ClienteService,
  EntrenadorService,
  MembresiaService,
  ClaseService,
  AsistenciaService,
  PagoService,
  AsistenciaEntrenadorService
} from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Cliente, Clase, Entrenador, Asistencia, Pago } from '../../models/gym.models';

interface BarraGrafico { etiqueta: string; valor: number; x: number; y: number; alto: number; color: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Panel de Control</h1>
          <p style="color: var(--text-secondary);">Bienvenido al sistema de gestión APEX FIT</p>
        </div>
        <div class="badge badge-info" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
          {{ todayDate | date:'fullDate':'':'es' }}
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid-cols" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 2.5rem;">
        <div class="glass-card flex-align-center" style="gap: 1.25rem;">
          <div class="icon-wrapper" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 2rem; height: 2rem;">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 style="font-size: 1.75rem; line-height: 1.2;">{{ totalClientes }}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">Clientes Registrados</p>
          </div>
        </div>

        <div class="glass-card flex-align-center" style="gap: 1.25rem;">
          <div class="icon-wrapper" style="background: rgba(168, 85, 247, 0.1); color: var(--accent-secondary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 2rem; height: 2rem;">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 style="font-size: 1.75rem; line-height: 1.2;">{{ totalEntrenadores }}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">Entrenadores Activos</p>
          </div>
        </div>

        <div class="glass-card flex-align-center" style="gap: 1.25rem;">
          <div class="icon-wrapper" style="background: rgba(245, 158, 11, 0.1); color: var(--warning);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 2rem; height: 2rem;">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div>
            <h3 style="font-size: 1.75rem; line-height: 1.2;">{{ totalMembresias }}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">Planes Ofrecidos</p>
          </div>
        </div>

        <div class="glass-card flex-align-center" style="gap: 1.25rem;">
          <div class="icon-wrapper" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 2rem; height: 2rem;">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h3 style="font-size: 1.75rem; line-height: 1.2;">\${{ totalRecaudado | number:'1.2-2' }}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;">Recaudación Total</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions and Info -->
      <div class="grid-cols" style="grid-template-columns: 1fr 1fr; @media (max-width: 900px) { grid-template-columns: 1fr; }">
        
        <!-- Attendance Quick Check-In -->
        <div class="glass-card">
          <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;" class="flex-align-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--accent-primary);">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Acceso Rápido (Asistencia)
          </h2>
          
          <form (submit)="registrarAsistencia()">
            <div class="form-group" *ngIf="esAdmin(); else usuarioActualAuto">
              <label class="form-label">Seleccionar Cliente</label>
              <select class="form-control" [(ngModel)]="asistenciaClienteId" name="cliente" required>
                <option [value]="null" disabled selected>-- Elegir Cliente --</option>
                <option *ngFor="let c of clientes" [value]="c.idCliente">
                  {{ c.nombre }} {{ c.apellido }} ({{ c.cedula }})
                </option>
              </select>
            </div>
            <ng-template #usuarioActualAuto>
              <div class="form-group">
                <label class="form-label">Usuario detectado automáticamente</label>
                <div class="form-control" style="display:flex; align-items:center; color: var(--text-secondary);">
                  {{ usuarioActualTexto }}
                </div>
              </div>
            </ng-template>
            
            <div class="form-group">
              <label class="form-label">Seleccionar Clase</label>
              <select class="form-control" [(ngModel)]="asistenciaClaseId" name="clase" required>
                <option [value]="null" disabled selected>-- Elegir Clase --</option>
                <option *ngFor="let cl of clases" [value]="cl.idClase">
                  {{ cl.nombre }} - {{ cl.horario }}
                </option>
              </select>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" [disabled]="(!asistenciaClienteId && obtenerRol() !== 'ENTRENADOR') || !asistenciaClaseId">
              Registrar Entrada
            </button>
          </form>
          
          <div *ngIf="asistenciaMensaje" style="margin-top: 1rem; padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.9rem;" 
               [ngClass]="{'badge-success': asistenciaExito, 'badge-danger': !asistenciaExito}">
            {{ asistenciaMensaje }}
          </div>
        </div>

        <!-- Trainers Speciality Overview -->
        <div class="glass-card">
          <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;" class="flex-align-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--accent-secondary);">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Staff de Entrenadores
          </h2>
          
          <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;">
            <div *ngFor="let ent of entrenadores" class="flex-between" style="padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div>
                <p style="font-weight: 600; margin-bottom: 0.1rem;">{{ ent.nombre }} {{ ent.apellido }}</p>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Tel: {{ ent.telefono }}</p>
              </div>
              <span class="badge badge-info">{{ ent.especialidad }}</span>
            </div>
            <div *ngIf="entrenadores.length === 0" style="text-align: center; color: var(--text-muted); padding: 2rem;">
              Staff pendiente de sincronización. Revisa el módulo Entrenadores.
            </div>
          </div>
        </div>

      </div>

      <!-- Diagramas -->
      <div class="grid-cols" style="margin-top: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));">

        <div class="glass-card">
          <h2 style="font-size: 1.25rem; margin-bottom: 0.25rem;" class="flex-align-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--accent-primary);">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Asistencias por Clase
          </h2>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">Total de asistencias registradas en cada clase</p>

          <svg *ngIf="barrasAsistencias.length > 0; else sinDatosAsis" viewBox="0 0 560 290" style="width: 100%; height: auto;" role="img" aria-label="Diagrama de asistencias por clase">
            <defs>
              <linearGradient id="gradBarra" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#a855f7"/>
                <stop offset="100%" stop-color="#6366f1"/>
              </linearGradient>
            </defs>
            <g *ngFor="let t of ticksAsistencias">
              <line x1="40" [attr.y1]="t.y" x2="545" [attr.y2]="t.y" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
              <text x="32" [attr.y]="t.y + 4" text-anchor="end" fill="#6b7280" font-size="11">{{ t.valor }}</text>
            </g>
            <g *ngFor="let b of barrasAsistencias">
              <rect [attr.x]="b.x" [attr.y]="b.y" width="38" [attr.height]="b.alto" rx="6" fill="url(#gradBarra)"/>
              <text [attr.x]="b.x + 19" [attr.y]="b.y - 6" text-anchor="middle" fill="#f3f4f6" font-size="12" font-weight="600">{{ b.valor }}</text>
              <text [attr.x]="b.x + 19" y="262" text-anchor="middle" fill="#9ca3af" font-size="11">{{ b.etiqueta }}</text>
            </g>
            <line x1="40" y1="240" x2="545" y2="240" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          </svg>
          <ng-template #sinDatosAsis>
            <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">Aún no hay asistencias registradas para graficar.</div>
          </ng-template>
        </div>

        <div class="glass-card" *ngIf="esAdmin()">
          <h2 style="font-size: 1.25rem; margin-bottom: 0.25rem;" class="flex-align-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--success);">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            Recaudación por Mes
          </h2>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">Pagos completados de los últimos 6 meses (USD)</p>

          <svg *ngIf="barrasIngresos.length > 0" viewBox="0 0 560 290" style="width: 100%; height: auto;" role="img" aria-label="Diagrama de recaudación por mes">
            <defs>
              <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#34d399"/>
                <stop offset="100%" stop-color="#059669"/>
              </linearGradient>
            </defs>
            <g *ngFor="let t of ticksIngresos">
              <line x1="50" [attr.y1]="t.y" x2="545" [attr.y2]="t.y" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
              <text x="42" [attr.y]="t.y + 4" text-anchor="end" fill="#6b7280" font-size="11">{{ t.valor }}</text>
            </g>
            <g *ngFor="let b of barrasIngresos">
              <rect [attr.x]="b.x" [attr.y]="b.y" width="44" [attr.height]="b.alto" rx="6" fill="url(#gradIngreso)"/>
              <text [attr.x]="b.x + 22" [attr.y]="b.y - 6" text-anchor="middle" fill="#f3f4f6" font-size="12" font-weight="600">\${{ b.valor }}</text>
              <text [attr.x]="b.x + 22" y="262" text-anchor="middle" fill="#9ca3af" font-size="11">{{ b.etiqueta }}</text>
            </g>
            <line x1="50" y1="240" x2="545" y2="240" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          </svg>
        </div>

      </div>
    </div>
  `,
  styles: `
    .icon-wrapper {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `
})
export class DashboardComponent implements OnInit {
  todayDate = new Date();
  
  totalClientes = 0;
  totalEntrenadores = 0;
  totalMembresias = 0;
  totalRecaudado = 0;

  clientes: Cliente[] = [];
  clases: Clase[] = [];
  entrenadores: Entrenador[] = [];
  entrenadorActual: Entrenador | null = null;

  // Datos de los diagramas
  barrasAsistencias: BarraGrafico[] = [];
  ticksAsistencias: { valor: number; y: number }[] = [];
  barrasIngresos: BarraGrafico[] = [];
  ticksIngresos: { valor: number; y: number }[] = [];

  // Quick attendance check-in model
  asistenciaClienteId: number | null = null;
  asistenciaClaseId: number | null = null;
  asistenciaMensaje = '';
  asistenciaExito = true;
  usuarioActualTexto = '';

  constructor(
    private clienteService: ClienteService,
    private entrenadorService: EntrenadorService,
    private membresiaService: MembresiaService,
    private claseService: ClaseService,
    private asistenciaService: AsistenciaService,
    private pagoService: PagoService,
    private asistenciaEntrenadorService: AsistenciaEntrenadorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    // Clientes
    this.clienteService.listar().subscribe({
      next: (res) => {
        this.clientes = this.filtrarClientesPorRol(res);
        this.totalClientes = this.clientes.length;
        this.asignarUsuarioActual();
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });

    // Entrenadores
    this.entrenadorService.listar().subscribe({
      next: (res) => {
        this.entrenadores = res;
        this.entrenadorActual = this.authService.obtenerRol() === 'ENTRENADOR' ? res.find(e => this.coincideUsuarioPersona(e)) || null : null;
        this.totalEntrenadores = this.entrenadores.length;
        this.asignarUsuarioActual();
      },
      error: (err) => console.error('Error cargando entrenadores:', err)
    });

    // Membresías
    this.membresiaService.listar().subscribe({
      next: (res) => {
        this.totalMembresias = res.length;
      },
      error: (err) => console.error('Error cargando membresias:', err)
    });

    // Clases (for quick attendance select)
    this.claseService.listar().subscribe({
      next: (res) => {
        this.clases = this.filtrarClasesPorRol(res);
      },
      error: (err) => console.error('Error cargando clases:', err)
    });

    // Asistencias (diagrama de barras por clase)
    this.asistenciaService.listar().subscribe({
      next: (res) => this.construirGraficoAsistencias(res),
      error: (err) => console.error('Error cargando asistencias:', err)
    });

    // Pagos (for total revenue sum)
    this.pagoService.listar().subscribe({
      next: (res) => {
        this.totalRecaudado = res
          .filter(p => p.estado && p.estado.toLowerCase() === 'completado')
          .reduce((sum, p) => sum + Number(p.monto), 0);
        this.construirGraficoIngresos(res);
      },
      error: (err) => console.error('Error cargando pagos:', err)
    });
  }


  private construirGraficoAsistencias(asistencias: Asistencia[]): void {
    const conteo = new Map<string, number>();
    asistencias.forEach(a => {
      const nombre = a.clase?.nombre || 'Sin clase';
      conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
    });
    const datos = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const g = this.calcularBarras(datos, 40, 545, 38, '#6366f1');
    this.barrasAsistencias = g.barras;
    this.ticksAsistencias = g.ticks;
  }

  private construirGraficoIngresos(pagos: Pago[]): void {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const claves: { clave: string; etiqueta: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      claves.push({
        clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        etiqueta: `${meses[d.getMonth()]} ${String(d.getFullYear()).substring(2)}`
      });
    }
    const totales = new Map<string, number>(claves.map(c => [c.clave, 0]));
    pagos
      .filter(p => p.estado && p.estado.toLowerCase() === 'completado' && p.fechaPago)
      .forEach(p => {
        const k = String(p.fechaPago).substring(0, 7);
        if (totales.has(k)) totales.set(k, (totales.get(k) || 0) + Number(p.monto));
      });
    const datos: [string, number][] = claves.map(c => [c.etiqueta, Math.round((totales.get(c.clave) || 0) * 100) / 100]);
    const g = this.calcularBarras(datos, 50, 545, 44, '#10b981');
    this.barrasIngresos = g.barras;
    this.ticksIngresos = g.ticks;
  }

  /** Calcula posiciones de barras y líneas guía dentro de un lienzo SVG de 560x290 (eje X en y=240). */
  private calcularBarras(datos: [string, number][], x0: number, x1: number, anchoBarra: number, color: string) {
    const base = 240, altoMax = 190;
    const max = Math.max(1, ...datos.map(d => d[1]));
    const tope = this.redondearTope(max);
    const paso = (x1 - x0) / Math.max(1, datos.length);
    const barras: BarraGrafico[] = datos.map(([etiqueta, valor], i) => {
      const alto = Math.max(valor > 0 ? 3 : 0, (valor / tope) * altoMax);
      const etiquetaCorta = etiqueta.length > 11 ? etiqueta.substring(0, 10) + '…' : etiqueta;
      return { etiqueta: etiquetaCorta, valor, alto, color, x: x0 + paso * i + (paso - anchoBarra) / 2, y: base - alto };
    });
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
      valor: Math.round(tope * f * 100) / 100,
      y: base - altoMax * f
    }));
    return { barras, ticks };
  }

  private redondearTope(max: number): number {
    if (max <= 4) return 4;
    const magnitud = Math.pow(10, Math.floor(Math.log10(max)));
    const paso = [1, 2, 4, 5, 10].map(m => m * magnitud).find(v => v >= max) || max;
    return paso;
  }

  obtenerRol(): string | null { return this.authService.obtenerRol(); }
  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }

  private coincideUsuarioPersona(persona: any): boolean {
    const user = this.authService.obtenerUsuario().toLowerCase();
    if (!user) return false;
    if (persona?.username && persona.username.toLowerCase() === user) return true;
    if (user === 'cliente' || user === 'entrenador') return true;
    const texto = `${persona?.nombre || ''} ${persona?.apellido || ''} ${persona?.correo || ''} ${persona?.username || ''}`.toLowerCase();
    return texto.includes(user);
  }

  private filtrarClientesPorRol(clientes: Cliente[]): Cliente[] {
    return clientes;
  }

  private filtrarEntrenadoresPorRol(entrenadores: Entrenador[]): Entrenador[] {
    return this.authService.obtenerRol() === 'ENTRENADOR' ? entrenadores.filter(e => this.coincideUsuarioPersona(e)) : entrenadores;
  }

  private filtrarClasesPorRol(clases: Clase[]): Clase[] {
    if (this.authService.obtenerRol() !== 'ENTRENADOR') return clases;
    return clases.filter(c => this.coincideUsuarioPersona(c.entrenador));
  }

  private asignarUsuarioActual(): void {
    const rol = this.authService.obtenerRol();
    if (rol === 'CLIENTE' && this.clientes.length) {
      const c = this.clientes[0];
      this.asistenciaClienteId = c.idCliente ?? null;
      this.usuarioActualTexto = `Cliente: ${c.nombre} ${c.apellido} (${c.cedula})`;
    } else if (rol === 'ENTRENADOR' && (this.entrenadorActual || this.entrenadores.length)) {
      const e = this.entrenadorActual || this.entrenadores[0];
      this.usuarioActualTexto = `Entrenador: ${e.nombre} ${e.apellido} (${e.especialidad})`;
    } else if (rol === 'ADMIN') {
      this.usuarioActualTexto = 'Administrador';
    }
  }

  registrarAsistencia(): void {
    if ((!this.asistenciaClienteId && this.authService.obtenerRol() !== 'ENTRENADOR') || !this.asistenciaClaseId) return;

    const clienteSel = this.clientes.find(c => c.idCliente === Number(this.asistenciaClienteId));
    const claseSel = this.clases.find(cl => cl.idClase === Number(this.asistenciaClaseId));

    if (!claseSel) {
      this.asistenciaExito = false;
      this.asistenciaMensaje = 'Clase no válida.';
      return;
    }

    if (this.authService.obtenerRol() === 'ENTRENADOR') {
      const entrenadorSel = this.entrenadorActual || this.entrenadores.find(e => this.coincideUsuarioPersona(e)) || this.entrenadores[0];
      if (!entrenadorSel) {
        this.asistenciaExito = false;
        this.asistenciaMensaje = 'No existe entrenador vinculado al usuario actual.';
        return;
      }
      const ahora = new Date();
      const horaActual = ahora.toTimeString().substring(0, 5);
      const asistenciaEntrenador = {
        entrenador: entrenadorSel,
        clase: claseSel,
        fechaAsistencia: ahora.toISOString().substring(0, 10),
        horaEntrada: horaActual
      };
      this.asistenciaEntrenadorService.guardar(asistenciaEntrenador as any).subscribe({
        next: () => {
          this.asistenciaExito = true;
          this.asistenciaMensaje = `Asistencia del entrenador registrada para la clase ${claseSel.nombre}.`;
          this.asistenciaClaseId = null;
          setTimeout(() => this.asistenciaMensaje = '', 4000);
        },
        error: (err) => {
          console.error('Error guardando asistencia de entrenador:', err);
          this.asistenciaExito = false;
          this.asistenciaMensaje = 'No se pudo guardar la asistencia del entrenador.';
        }
      });
      return;
    }

    if (!clienteSel) {
      this.asistenciaExito = false;
      this.asistenciaMensaje = 'Cliente no válido.';
      return;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    const nuevaAsistencia = {
      cliente: clienteSel,
      clase: claseSel,
      fechaAsistencia: todayStr
    };

    this.asistenciaService.guardar(nuevaAsistencia).subscribe({
      next: (res) => {
        this.asistenciaExito = true;
        this.asistenciaMensaje = `¡Registro exitoso! ${clienteSel.nombre} ha ingresado a ${claseSel.nombre}.`;
        if (this.esAdmin()) this.asistenciaClienteId = null;
        this.asistenciaClaseId = null;
        // clear message after 4s
        setTimeout(() => this.asistenciaMensaje = '', 4000);
      },
      error: (err) => {
        console.error('Error guardando asistencia:', err);
        this.asistenciaExito = false;
        this.asistenciaMensaje = 'No se pudo guardar la asistencia en el servidor.';
      }
    });
  }
}
