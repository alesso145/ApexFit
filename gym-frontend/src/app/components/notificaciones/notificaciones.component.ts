import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificacion, NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="bell" type="button" (click)="alternarPanel($event)" title="Notificaciones" aria-label="Notificaciones">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span class="count" *ngIf="noLeidas > 0">{{ noLeidas > 9 ? '9+' : noLeidas }}</span>
    </button>

    <div class="panel" *ngIf="abierto" (click)="$event.stopPropagation()">
      <div class="panel-head">
        <strong>Notificaciones</strong>
        <div class="panel-actions">
          <button type="button" (click)="marcarTodas()" [disabled]="noLeidas === 0">Marcar leídas</button>
          <button type="button" class="danger" (click)="borrarTodas()" [disabled]="notificaciones.length === 0">Borrar todo</button>
        </div>
      </div>

      <div class="panel-list">
        <div class="item" *ngFor="let n of notificaciones" [class.unread]="!n.leida" (click)="abrir(n)">
          <div class="icon" [ngClass]="'t-' + n.tipo">{{ icono(n.tipo) }}</div>
          <div class="body">
            <div class="title">{{ n.titulo }}</div>
            <div class="msg">{{ n.mensaje }}</div>
            <div class="time">{{ tiempo(n.fecha) }}</div>
          </div>
          <button class="del" type="button" title="Eliminar" (click)="eliminar(n, $event)">×</button>
        </div>
        <div class="empty" *ngIf="notificaciones.length === 0">No tienes notificaciones.</div>
      </div>
    </div>

    <div class="toast" *ngIf="toast" (click)="toast = null">
      <span class="icon" [ngClass]="'t-' + toast.tipo">{{ icono(toast.tipo) }}</span>
      <div>
        <div class="title">{{ toast.titulo }}</div>
        <div class="msg">{{ toast.mensaje }}</div>
      </div>
    </div>
  `,
  styles: `
    :host { display: contents; }
    .bell {
      position: fixed; top: 1.35rem; left: 232px; z-index: 300;
      width: 2.5rem; height: 2.5rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
      color: var(--text-secondary); cursor: pointer; transition: var(--transition-smooth);
    }
    .bell:hover { color: var(--text-primary); background: rgba(99,102,241,0.18); border-color: var(--accent-primary); }
    .bell svg { width: 1.2rem; height: 1.2rem; }
    .count {
      position: absolute; top: -4px; right: -4px; min-width: 1.15rem; height: 1.15rem; padding: 0 4px;
      border-radius: 999px; background: var(--danger); color: #fff; font-size: 0.68rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px var(--bg-primary);
    }
    .panel {
      position: fixed; top: 4.4rem; left: 296px; z-index: 300; width: 400px; max-width: calc(100vw - 320px);
      background: #111827; border: 1px solid var(--border-color-hover); border-radius: var(--radius-lg);
      box-shadow: 0 20px 50px rgba(0,0,0,0.55); overflow: hidden;
    }
    .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1rem; border-bottom: 1px solid var(--border-color); }
    .panel-actions { display: flex; gap: 0.5rem; }
    .panel-actions button {
      background: transparent; border: none; color: var(--accent-primary); font-size: 0.78rem; font-weight: 600;
      cursor: pointer; font-family: var(--font-sans);
    }
    .panel-actions button.danger { color: #f87171; }
    .panel-actions button:disabled { opacity: 0.35; cursor: default; }
    .panel-list { max-height: 420px; overflow-y: auto; }
    .item { display: flex; gap: 0.75rem; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; align-items: flex-start; }
    .item:hover { background: rgba(255,255,255,0.03); }
    .item.unread { background: rgba(99,102,241,0.08); }
    .item.unread .title::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--accent-primary); margin-right: 6px; }
    .icon { flex: none; width: 2.1rem; height: 2.1rem; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(99,102,241,0.15); font-size: 1rem; }
    .t-VENTA { background: rgba(16,185,129,0.15); }
    .t-CLASE { background: rgba(99,102,241,0.18); }
    .t-INSCRIPCION { background: rgba(245,158,11,0.15); }
    .t-SEGURIDAD { background: rgba(239,68,68,0.15); }
    .body { flex: 1; min-width: 0; }
    .title { font-weight: 600; font-size: 0.88rem; }
    .msg { color: var(--text-secondary); font-size: 0.8rem; margin-top: 2px; overflow-wrap: anywhere; }
    .time { color: var(--text-muted); font-size: 0.72rem; margin-top: 4px; }
    .del { flex: none; background: transparent; border: none; color: var(--text-muted); font-size: 1.2rem; line-height: 1; cursor: pointer; }
    .del:hover { color: #f87171; }
    .empty { text-align: center; color: var(--text-muted); padding: 2.2rem 1rem; font-size: 0.88rem; }
    .toast {
      position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 400; max-width: 360px; display: flex; gap: 0.75rem;
      padding: 0.9rem 1rem; background: #111827; border: 1px solid var(--accent-primary); border-radius: var(--radius-md);
      box-shadow: 0 14px 40px rgba(0,0,0,0.5); cursor: pointer; animation: subir 0.3s ease;
    }
    @keyframes subir { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
    @media (max-width: 900px) { .bell { left: auto; right: 1rem; } .panel { left: 1rem; right: 1rem; width: auto; max-width: none; } }
  `
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  noLeidas = 0;
  abierto = false;
  toast: Notificacion | null = null;

  private timer: any = null;
  private toastTimer: any = null;
  private ultimoIdVisto: number | null = null;

  constructor(
    private service: NotificacionService,
    private authService: AuthService,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.timer = setInterval(() => this.cargar(), 15000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  @HostListener('document:click')
  cerrarPanel(): void {
    this.abierto = false;
  }

  alternarPanel(event: Event): void {
    event.stopPropagation();
    this.abierto = !this.abierto;
    if (this.abierto) this.cargar();
  }

  cargar(): void {
    if (!this.authService.estaLogueado()) return;
    this.service.listar().subscribe({
      next: (lista) => {
        const maxId = lista.reduce((m, n) => Math.max(m, n.idNotificacion), 0);
        // Aviso emergente solo cuando llega algo nuevo después de la primera carga
        if (this.ultimoIdVisto !== null && maxId > this.ultimoIdVisto) {
          const nueva = lista.find(n => n.idNotificacion === maxId && !n.leida);
          if (nueva) this.mostrarToast(nueva);
        }
        this.ultimoIdVisto = maxId;
        this.notificaciones = lista;
        this.noLeidas = lista.filter(n => !n.leida).length;
      },
      error: () => { /* sin conexión o sesión vencida: se reintenta en el siguiente ciclo */ }
    });
  }

  private mostrarToast(n: Notificacion): void {
    this.toast = n;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = null, 6000);
  }

  abrir(n: Notificacion): void {
    if (n.leida) return;
    this.service.marcarLeida(n.idNotificacion).subscribe(() => {
      n.leida = true;
      this.noLeidas = this.notificaciones.filter(x => !x.leida).length;
    });
  }

  marcarTodas(): void {
    this.service.marcarTodasLeidas().subscribe(() => {
      this.notificaciones.forEach(n => n.leida = true);
      this.noLeidas = 0;
    });
  }

  eliminar(n: Notificacion, event: Event): void {
    event.stopPropagation();
    this.service.eliminar(n.idNotificacion).subscribe(() => {
      this.notificaciones = this.notificaciones.filter(x => x.idNotificacion !== n.idNotificacion);
      this.noLeidas = this.notificaciones.filter(x => !x.leida).length;
    });
  }

  borrarTodas(): void {
    this.service.eliminarTodas().subscribe(() => {
      this.notificaciones = [];
      this.noLeidas = 0;
    });
  }

  icono(tipo: string): string {
    switch (tipo) {
      case 'VENTA': return '🛒';
      case 'CLASE': return '🏋️';
      case 'INSCRIPCION': return '📝';
      case 'SEGURIDAD': return '🔒';
      default: return '🔔';
    }
  }

  tiempo(fecha: string): string {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';
    const seg = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seg < 60) return 'Ahora mismo';
    const min = Math.floor(seg / 60);
    if (min < 60) return `Hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Hace ${h} h`;
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }
}
