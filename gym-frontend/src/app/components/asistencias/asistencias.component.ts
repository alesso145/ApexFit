import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService, ClienteService, ClaseService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Asistencia, Cliente, Clase } from '../../models/gym.models';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Asistencias</h1>
          <p style="color: var(--text-secondary);">Registro de asistencia diaria a las clases del gimnasio</p>
        </div>
        <button class="btn btn-primary" *ngIf="puedeRegistrar()" (click)="abrirModalAdicion()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ esAdmin() ? 'Registrar Asistencia' : 'Inscribirme a otra clase' }}
        </button>
      </div>

      <div *ngIf="mensaje" class="badge" style="display:block; margin-bottom: 1rem; padding: 0.75rem 1rem; font-size: 0.9rem;"
           [ngClass]="mensajeExito ? 'badge-success' : 'badge-danger'">
        {{ mensaje }}
      </div>

      <!-- Search & Filters -->
      <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="form-control" style="border: none; background: transparent; padding: 0.25rem 0;" 
               placeholder="Buscar por cliente, clase o fecha..." [(ngModel)]="filtroBusqueda" (input)="filtrarAsistencias()">
      </div>

      <!-- Attendance Table -->
      <div class="glass-card" style="padding: 0;">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Clase</th>
                <th>Fecha de Asistencia</th>
                <th>Horario de la Clase</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let asis of asistenciasFiltradas">
                <td>
                  <strong>{{ asis.cliente.nombre }} {{ asis.cliente.apellido }}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Cédula: {{ asis.cliente.cedula }}</div>
                </td>
                <td><strong style="color: var(--accent-primary);">{{ asis.clase.nombre }}</strong></td>
                <td>{{ asis.fechaAsistencia }}</td>
                <td>{{ asis.clase.horario }}</td>
                <td style="text-align: right;">
                  <button class="btn btn-danger btn-icon" *ngIf="esAdmin(); else soloLecturaAsistencia" (click)="confirmarEliminar(asis)" title="Eliminar Asistencia">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                  <ng-template #soloLecturaAsistencia><span style="color: var(--text-muted);">Solo lectura</span></ng-template>
                </td>
              </tr>
              <tr *ngIf="asistenciasFiltradas.length === 0">
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  No se encontraron registros de asistencias.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Modal -->
      <div class="modal-overlay" [ngClass]="{'active': mostrarModalForm}">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Registrar Nueva Asistencia</h3>
            <button class="btn btn-secondary btn-icon" style="padding: 0.25rem; border: none; background: transparent;" (click)="cerrarModalForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form (submit)="guardarAsistencia()">
            <div class="modal-body">
              
              <!-- Client Selector: admin elige; el cliente autenticado se detecta solo -->
              <div class="form-group" *ngIf="esAdmin(); else clienteAuto">
                <label class="form-label">Cliente</label>
                <select class="form-control" [(ngModel)]="seleccionClienteId" name="clienteId" required>
                  <option [value]="null" disabled selected>-- Seleccionar Cliente --</option>
                  <option *ngFor="let c of clientes" [value]="c.idCliente">
                    {{ c.nombre }} {{ c.apellido }} (Cédula: {{ c.cedula }})
                  </option>
                </select>
              </div>
              <ng-template #clienteAuto>
                <div class="form-group">
                  <label class="form-label">Cliente detectado automáticamente</label>
                  <div class="form-control" style="display:flex; align-items:center; color: var(--text-secondary);">
                    {{ clienteActualTexto }}
                  </div>
                </div>
              </ng-template>

              <!-- Class Selector -->
              <div class="form-group">
                <label class="form-label">Clase</label>
                <select class="form-control" [(ngModel)]="seleccionClaseId" name="claseId" required>
                  <option [value]="null" disabled selected>-- Seleccionar Clase --</option>
                  <option *ngFor="let cl of clases" [value]="cl.idClase">
                    {{ cl.nombre }} ({{ cl.horario }})
                  </option>
                </select>
              </div>

              <!-- Date Picker -->
              <div class="form-group">
                <label class="form-label">Fecha de Asistencia</label>
                <input type="date" class="form-control" [(ngModel)]="model.fechaAsistencia" name="fechaAsistencia" required [readonly]="!esAdmin()">
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="!seleccionClienteId || !seleccionClaseId">
                Registrar Entrada
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" [ngClass]="{'active': mostrarModalEliminar}">
        <div class="modal-content" style="max-width: 400px;">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que deseas eliminar este registro de asistencia de <strong>{{ asistenciaAEliminar?.cliente?.nombre }} {{ asistenciaAEliminar?.cliente?.apellido }}</strong> en la clase de <strong>{{ asistenciaAEliminar?.clase?.nombre }}</strong>?</p>
            <p style="color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
              * Esta acción borrará permanentemente la asistencia seleccionada.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalEliminar = false">Cancelar</button>
            <button class="btn btn-danger" (click)="eliminarAsistencia()">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AsistenciasComponent implements OnInit {
  asistencias: Asistencia[] = [];
  asistenciasFiltradas: Asistencia[] = [];
  filtroBusqueda = '';

  // Dropdowns lists
  clientes: Cliente[] = [];
  clases: Clase[] = [];

  // Dropdown selections
  seleccionClienteId: number | null = null;
  seleccionClaseId: number | null = null;

  clienteActualTexto = '';
  mensaje = '';
  mensajeExito = true;

  // Modals status
  mostrarModalForm = false;
  mostrarModalEliminar = false;

  // Active form model
  model: Asistencia = this.nuevaAsistencia();
  asistenciaAEliminar: Asistencia | null = null;

  constructor(
    private service: AsistenciaService,
    private clienteService: ClienteService,
    private claseService: ClaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Asistencias
    this.service.listar().subscribe({
      next: (res) => {
        this.asistencias = this.filtrarPorRol(res);
        this.filtrarAsistencias();
      },
      error: (err) => console.error('Error cargando asistencias:', err)
    });

    // Clientes
    this.clienteService.listar().subscribe({
      next: (res) => {
        this.clientes = this.filtrarClientesPorRol(res.filter(c => c.estado)); // only active
        this.asignarClienteActual();
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });

    // Clases
    this.claseService.listar().subscribe({
      next: (res) => {
        this.clases = this.filtrarClasesPorRol(res);
      },
      error: (err) => console.error('Error cargando clases:', err)
    });
  }

  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }
  esCliente(): boolean { return this.authService.obtenerRol() === 'CLIENTE'; }
  puedeRegistrar(): boolean { return this.esAdmin() || this.esCliente(); }

  /** El backend ya devuelve solo el cliente propio cuando el rol es CLIENTE. */
  private asignarClienteActual(): void {
    if (this.esCliente() && this.clientes.length) {
      const c = this.clientes[0];
      this.seleccionClienteId = c.idCliente ?? null;
      this.clienteActualTexto = `${c.nombre} ${c.apellido} (${c.cedula})`;
    }
  }

  private mostrarMensaje(texto: string, exito: boolean): void {
    this.mensaje = texto;
    this.mensajeExito = exito;
    setTimeout(() => this.mensaje = '', 4500);
  }

  private filtrarPorRol(asistencias: Asistencia[]): Asistencia[] {
    return asistencias;
  }

  private filtrarClientesPorRol(clientes: Cliente[]): Cliente[] {
    return clientes;
  }

  private filtrarClasesPorRol(clases: Clase[]): Clase[] {
    return clases;
  }

  filtrarAsistencias(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) {
      this.asistenciasFiltradas = [...this.asistencias];
      return;
    }
    this.asistenciasFiltradas = this.asistencias.filter(asis =>
      asis.cliente.nombre.toLowerCase().includes(q) ||
      asis.cliente.apellido.toLowerCase().includes(q) ||
      asis.clase.nombre.toLowerCase().includes(q) ||
      asis.fechaAsistencia.includes(q)
    );
  }

  nuevaAsistencia(): Asistencia {
    const today = new Date().toISOString().substring(0, 10);
    return {
      cliente: {} as Cliente,
      clase: {} as Clase,
      fechaAsistencia: today
    };
  }

  abrirModalAdicion(): void {
    this.model = this.nuevaAsistencia();
    if (!this.esCliente()) this.seleccionClienteId = null;
    else this.asignarClienteActual();
    this.seleccionClaseId = null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarAsistencia(): void {
    if (!this.seleccionClienteId || !this.seleccionClaseId || !this.model.fechaAsistencia) return;

    const clienteSel = this.clientes.find(c => c.idCliente === Number(this.seleccionClienteId));
    const claseSel = this.clases.find(cl => cl.idClase === Number(this.seleccionClaseId));

    if (!clienteSel || !claseSel) return;

    // Evita duplicar la misma clase el mismo día para el mismo cliente
    const yaRegistrada = this.asistencias.some(a =>
      a.cliente?.idCliente === clienteSel.idCliente &&
      a.clase?.idClase === claseSel.idClase &&
      a.fechaAsistencia === this.model.fechaAsistencia);
    if (yaRegistrada) {
      this.cerrarModalForm();
      this.mostrarMensaje(`Ya estás inscrito en ${claseSel.nombre} para esta fecha. Elige otra clase.`, false);
      return;
    }

    this.model.cliente = clienteSel;
    this.model.clase = claseSel;

    this.service.guardar(this.model).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModalForm();
        this.mostrarMensaje(`¡Listo! Quedaste inscrito en la clase ${claseSel.nombre}.`, true);
      },
      error: (err) => {
        console.error('Error guardando asistencia:', err);
        this.mostrarMensaje('No se pudo registrar la inscripción a la clase.', false);
      }
    });
  }

  confirmarEliminar(asistencia: Asistencia): void {
    this.asistenciaAEliminar = asistencia;
    this.mostrarModalEliminar = true;
  }

  eliminarAsistencia(): void {
    if (!this.asistenciaAEliminar || this.asistenciaAEliminar.idAsistencia === undefined) return;

    this.service.eliminar(this.asistenciaAEliminar.idAsistencia).subscribe({
      next: () => {
        this.cargarDatos();
        this.mostrarModalEliminar = false;
        this.asistenciaAEliminar = null;
      },
      error: (err) => console.error('Error eliminando asistencia:', err)
    });
  }
}
