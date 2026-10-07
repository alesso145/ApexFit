import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaEntrenador, Clase, Entrenador } from '../../models/gym.models';
import { AsistenciaEntrenadorService, ClaseService, EntrenadorService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-asistencia-entrenadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Asistencia de Entrenadores</h1>
          <p style="color: var(--text-secondary);">Registro de clases dictadas, hora de entrada y tiempo de uso.</p>
        </div>
        <button class="btn btn-primary" type="button" (click)="registrarEntradaRapida()">Registrar Entrada</button>
      </div>

      <div class="glass-card" style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Registro rápido</h2>
        <div class="grid-cols" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div class="form-group" *ngIf="esAdmin(); else entrenadorAuto">
            <label class="form-label">Entrenador</label>
            <select class="form-control" [(ngModel)]="modeloEntrenadorId">
              <option [ngValue]="null">-- Seleccionar Entrenador --</option>
              <option *ngFor="let e of entrenadores" [ngValue]="e.idEntrenador">{{ e.nombre }} {{ e.apellido }}</option>
            </select>
          </div>
          <ng-template #entrenadorAuto>
            <div class="form-group">
              <label class="form-label">Entrenador detectado automáticamente</label>
              <div class="form-control" style="display:flex; align-items:center; color: var(--text-secondary);">{{ entrenadorActualTexto }}</div>
            </div>
          </ng-template>

          <div class="form-group">
            <label class="form-label">Clase a dictar</label>
            <select class="form-control" [(ngModel)]="modeloClaseId">
              <option [ngValue]="null">-- Seleccionar Clase --</option>
              <option *ngFor="let c of clases" [ngValue]="c.idClase">{{ c.nombre }} - {{ c.aula || 'Sin aula' }} - {{ c.horario }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Hora entrada</label>
            <input class="form-control" type="time" [(ngModel)]="horaEntrada">
          </div>

          <div class="form-group">
            <label class="form-label">Hora salida</label>
            <input class="form-control" type="time" [(ngModel)]="horaSalida">
          </div>
        </div>
        <div *ngIf="mensaje" style="margin-top: 1rem; padding: .75rem; border-radius: var(--radius-md);" [ngClass]="exito ? 'badge-success' : 'badge-danger'">{{ mensaje }}</div>
      </div>

      <div class="table-container glass-card">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Entrenador</th>
              <th>Clase</th>
              <th>Aula / Área</th>
              <th>Fecha</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Tiempo</th>
              <th *ngIf="esAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of asistencias">
              <td>{{ a.entrenador.nombre }} {{ a.entrenador.apellido }}</td>
              <td>{{ a.clase.nombre }}</td>
              <td>{{ a.clase.aula || 'Sin aula' }}</td>
              <td>{{ a.fechaAsistencia }}</td>
              <td>{{ a.horaEntrada || '-' }}</td>
              <td>{{ a.horaSalida || '-' }}</td>
              <td>{{ formatearTiempo(a.tiempoMinutos) }}</td>
              <td *ngIf="esAdmin()">
                <button class="btn btn-danger btn-icon" type="button" (click)="eliminar(a)">🗑</button>
              </td>
            </tr>
            <tr *ngIf="asistencias.length === 0">
              <td colspan="8" style="text-align:center; color: var(--text-muted); padding:2rem;">No hay asistencias de entrenadores registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AsistenciaEntrenadoresComponent implements OnInit {
  asistencias: AsistenciaEntrenador[] = [];
  entrenadores: Entrenador[] = [];
  clases: Clase[] = [];
  modeloEntrenadorId: number | null = null;
  modeloClaseId: number | null = null;
  horaEntrada = new Date().toTimeString().substring(0, 5);
  horaSalida = '';
  mensaje = '';
  exito = true;
  entrenadorActualTexto = '';

  constructor(
    private asistenciaEntrenadorService: AsistenciaEntrenadorService,
    private entrenadorService: EntrenadorService,
    private claseService: ClaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }
  esEntrenador(): boolean { return this.authService.obtenerRol() === 'ENTRENADOR'; }

  cargarDatos(): void {
    this.asistenciaEntrenadorService.listar().subscribe({ next: r => this.asistencias = r, error: e => console.error(e) });
    this.entrenadorService.listar().subscribe({
      next: r => {
        this.entrenadores = this.esEntrenador() ? r.filter(e => this.coincideUsuario(e)) : r;
        if (this.esEntrenador() && this.entrenadores.length) {
          const e = this.entrenadores[0];
          this.modeloEntrenadorId = e.idEntrenador || null;
          this.entrenadorActualTexto = `${e.nombre} ${e.apellido} (${e.especialidad})`;
        }
      },
      error: e => console.error(e)
    });
    this.claseService.listar().subscribe({
      next: r => this.clases = this.esEntrenador() ? r.filter(c => this.coincideUsuario(c.entrenador)) : r,
      error: e => console.error(e)
    });
  }

  private coincideUsuario(persona: any): boolean {
    const user = this.authService.obtenerUsuario().toLowerCase();
    if (!user) return false;
    if (persona?.username && persona.username.toLowerCase() === user) return true;
    if (user === 'entrenador') return true;
    const texto = `${persona?.nombre || ''} ${persona?.apellido || ''} ${persona?.username || ''}`.toLowerCase();
    return texto.includes(user);
  }

  registrarEntradaRapida(): void {
    const entrenador = this.entrenadores.find(e => e.idEntrenador === Number(this.modeloEntrenadorId));
    const clase = this.clases.find(c => c.idClase === Number(this.modeloClaseId));
    if (!entrenador || !clase) {
      this.exito = false;
      this.mensaje = 'Selecciona entrenador y clase.';
      return;
    }
    const asistencia: AsistenciaEntrenador = {
      entrenador,
      clase,
      fechaAsistencia: new Date().toISOString().substring(0, 10),
      horaEntrada: this.horaEntrada,
      horaSalida: this.horaSalida || undefined
    };
    this.asistenciaEntrenadorService.guardar(asistencia).subscribe({
      next: () => {
        this.exito = true;
        this.mensaje = 'Asistencia de entrenador registrada correctamente.';
        this.modeloClaseId = null;
        this.horaEntrada = new Date().toTimeString().substring(0, 5);
        this.horaSalida = '';
        this.cargarDatos();
      },
      error: e => {
        console.error(e);
        this.exito = false;
        this.mensaje = 'No se pudo registrar la asistencia del entrenador.';
      }
    });
  }

  eliminar(a: AsistenciaEntrenador): void {
    if (!a.idAsistenciaEntrenador || !confirm('¿Eliminar asistencia del entrenador?')) return;
    this.asistenciaEntrenadorService.eliminar(a.idAsistenciaEntrenador).subscribe({ next: () => this.cargarDatos() });
  }

  formatearTiempo(minutos?: number): string {
    if (minutos == null) return '-';
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}m`;
  }
}
