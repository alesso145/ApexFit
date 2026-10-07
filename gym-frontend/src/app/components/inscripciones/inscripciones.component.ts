import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionService, ClienteService, MembresiaService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Inscripcion, Cliente, Membresia } from '../../models/gym.models';

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Inscripciones</h1>
          <p style="color: var(--text-secondary);">Registro y control de membresías contratadas por clientes</p>
        </div>
        <button class="btn btn-primary" *ngIf="puedeCrearInscripcion()" (click)="abrirModalAdicion()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ esAdmin() ? 'Nueva Inscripción' : 'Ingresar otra inscripción' }}
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="form-control" style="border: none; background: transparent; padding: 0.25rem 0;" 
               placeholder="Buscar por cliente o membresía..." [(ngModel)]="filtroBusqueda" (input)="filtrarInscripciones()">
      </div>

      <!-- Enrollments Table -->
      <div class="glass-card" style="padding: 0;">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Membresía</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ins of inscripcionesFiltradas">
                <td>
                  <strong>{{ ins.cliente.nombre }} {{ ins.cliente.apellido }}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">C.I. {{ ins.cliente.cedula }}</div>
                </td>
                <td>
                  {{ ins.membresia.nombre }}
                  <div style="font-size: 0.75rem; color: var(--success); font-weight: 500;">\${{ ins.membresia.precio | number:'1.2-2' }}</div>
                </td>
                <td>{{ ins.fechaInicio }}</td>
                <td>{{ ins.fechaFin }}</td>
                <td>
                  <span class="badge" [ngClass]="obtenerClaseEstado(ins.estado)">
                    {{ ins.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div *ngIf="esAdmin(); else soloLecturaInscripcion" style="display: inline-flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-icon" (click)="abrirModalEdicion(ins)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn btn-danger btn-icon" (click)="confirmarEliminar(ins)" title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                  <ng-template #soloLecturaInscripcion><span style="color: var(--text-muted);">Solo lectura</span></ng-template>
                </td>
              </tr>
              <tr *ngIf="inscripcionesFiltradas.length === 0">
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  No se encontraron inscripciones.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" [ngClass]="{'active': mostrarModalForm}">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ esEdicion ? 'Editar Inscripción' : 'Nueva Inscripción' }}</h3>
            <button class="btn btn-secondary btn-icon" style="padding: 0.25rem; border: none; background: transparent;" (click)="cerrarModalForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form (submit)="guardarInscripcion()">
            <div class="modal-body">
              
              <!-- Cliente: admin selecciona; cliente autenticado se carga solo -->
              <div class="form-group" *ngIf="esAdmin(); else clienteAutoInscripcion">
                <label class="form-label">Cliente</label>
                <select class="form-control" [(ngModel)]="seleccionClienteId" name="clienteId" required [disabled]="esEdicion">
                  <option [value]="null" disabled selected>-- Seleccionar Cliente --</option>
                  <option *ngFor="let c of clientes" [value]="c.idCliente">
                    {{ c.nombre }} {{ c.apellido }} (Cédula: {{ c.cedula }})
                  </option>
                </select>
              </div>
              <ng-template #clienteAutoInscripcion>
                <div class="form-group">
                  <label class="form-label">Cliente detectado automáticamente</label>
                  <div class="form-control" style="display:flex; align-items:center; color:var(--text-secondary);">
                    {{ clienteActualTexto }}
                  </div>
                </div>
              </ng-template>

              <!-- Membership Selector -->
              <div class="form-group">
                <label class="form-label">Membresía (Plan)</label>
                <select class="form-control" [(ngModel)]="seleccionMembresiaId" name="membresiaId" required (change)="onMembresiaChange()">
                  <option [value]="null" disabled selected>-- Seleccionar Plan --</option>
                  <option *ngFor="let m of membresias" [value]="m.idMembresia">
                    {{ m.nombre }} ({{ m.duracionDias }} días - \${{ m.precio }})
                  </option>
                </select>
              </div>

              <!-- Start Date -->
              <div class="form-group">
                <label class="form-label">Fecha de Inicio</label>
                <input type="date" class="form-control" [(ngModel)]="model.fechaInicio" name="fechaInicio" required (change)="recalcularFechas()">
              </div>

              <!-- End Date (computed or view-only) -->
              <div class="form-group">
                <label class="form-label">Fecha de Fin (Calculada automáticamente)</label>
                <input type="date" class="form-control" [(ngModel)]="model.fechaFin" name="fechaFin" required readonly style="background: rgba(255, 255, 255, 0.01); color: var(--text-secondary); cursor: not-allowed;">
              </div>

              <!-- Status -->
              <div class="form-group">
                <label class="form-label">Estado de la Inscripción</label>
                <select class="form-control" [(ngModel)]="model.estado" name="estado" required>
                  <option value="Activa">Activa</option>
                  <option value="Vencida">Vencida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="!seleccionClienteId || !seleccionMembresiaId">
                {{ esEdicion ? 'Actualizar' : 'Guardar' }}
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
            <p>¿Estás seguro de que deseas eliminar la inscripción de <strong>{{ inscripcionAEliminar?.cliente?.nombre }} {{ inscripcionAEliminar?.cliente?.apellido }}</strong> en el plan <strong>{{ inscripcionAEliminar?.membresia?.nombre }}</strong>?</p>
            <p style="color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
              * Esta acción eliminará el registro de forma permanente.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalEliminar = false">Cancelar</button>
            <button class="btn btn-danger" (click)="eliminarInscripcion()">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class InscripcionesComponent implements OnInit {
  inscripciones: Inscripcion[] = [];
  inscripcionesFiltradas: Inscripcion[] = [];
  filtroBusqueda = '';

  // Dropdown lists
  clientes: Cliente[] = [];
  membresias: Membresia[] = [];

  // Dropdown selection IDs
  seleccionClienteId: number | null = null;
  seleccionMembresiaId: number | null = null;

  // Modals status
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;

  // Active form model
  model: Inscripcion = this.nuevaInscripcion();
  inscripcionAEliminar: Inscripcion | null = null;
  clienteActualTexto = '';

  constructor(
    private service: InscripcionService,
    private clienteService: ClienteService,
    private membresiaService: MembresiaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }


  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }
  puedeCrearInscripcion(): boolean {
    const rol = this.authService.obtenerRol();
    return rol === 'ADMIN' || rol === 'CLIENTE';
  }

  private esClientePropio(cliente: Cliente): boolean {
    const user = this.authService.obtenerUsuario().toLowerCase();
    if (!user) return false;
    if (cliente?.username && cliente.username.toLowerCase() === user) return true;
    if (user === 'cliente') return true;
    return `${cliente?.nombre || ''} ${cliente?.apellido || ''} ${cliente?.correo || ''} ${cliente?.username || ''}`.toLowerCase().includes(user);
  }

  private filtrarPorRol(inscripciones: Inscripcion[]): Inscripcion[] {
    // El backend ya filtra por authUserId cuando el rol es CLIENTE.
    // Si se aplica un filtro adicional, aseguramos que reconozca el username y la identidad.
    if (this.authService.obtenerRol() === 'CLIENTE') {
      return inscripciones.length > 0 ? inscripciones : [];
    }
    return inscripciones;
  }

  private filtrarClientesPorRol(clientes: Cliente[]): Cliente[] {
    if (this.authService.obtenerRol() === 'CLIENTE') {
      return clientes;
    }
    return clientes;
  }

  private asignarClienteActual(): void {
    if (this.authService.obtenerRol() === 'CLIENTE' && this.clientes.length) {
      const c = this.clientes[0];
      this.seleccionClienteId = c.idCliente ?? null;
      this.clienteActualTexto = `${c.nombre} ${c.apellido} (${c.cedula})`;
    }
  }

  cargarDatos(): void {
    // Inscripciones
    this.service.listar().subscribe({
      next: (res) => {
        this.inscripciones = this.filtrarPorRol(res);
        this.filtrarInscripciones();
      },
      error: (err) => console.error('Error cargando inscripciones:', err)
    });

    // Clientes
    this.clienteService.listar().subscribe({
      next: (res) => {
        this.clientes = this.filtrarClientesPorRol(res.filter(c => c.estado)); // Only active clients
        this.asignarClienteActual();
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });

    // Membresías
    this.membresiaService.listar().subscribe({
      next: (res) => {
        this.membresias = res;
      },
      error: (err) => console.error('Error cargando membresias:', err)
    });
  }

  filtrarInscripciones(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) {
      this.inscripcionesFiltradas = [...this.inscripciones];
      return;
    }
    this.inscripcionesFiltradas = this.inscripciones.filter(ins =>
      ins.cliente.nombre.toLowerCase().includes(q) ||
      ins.cliente.apellido.toLowerCase().includes(q) ||
      ins.membresia.nombre.toLowerCase().includes(q) ||
      ins.estado.toLowerCase().includes(q)
    );
  }

  nuevaInscripcion(): Inscripcion {
    const today = new Date().toISOString().substring(0, 10);
    return {
      cliente: {} as Cliente,
      membresia: {} as Membresia,
      fechaInicio: today,
      fechaFin: today,
      estado: 'Activa'
    };
  }

  abrirModalAdicion(): void {
    this.esEdicion = false;
    this.model = this.nuevaInscripcion();
    this.seleccionClienteId = this.esAdmin() ? null : this.seleccionClienteId;
    this.seleccionMembresiaId = null;
    this.mostrarModalForm = true;
  }

  abrirModalEdicion(inscripcion: Inscripcion): void {
    this.esEdicion = true;
    this.model = { ...inscripcion };
    this.seleccionClienteId = inscripcion.cliente.idCliente ?? null;
    this.seleccionMembresiaId = inscripcion.membresia.idMembresia ?? null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  onMembresiaChange(): void {
    this.recalcularFechas();
  }

  recalcularFechas(): void {
    if (!this.seleccionMembresiaId || !this.model.fechaInicio) return;

    const membresiaSel = this.membresias.find(m => m.idMembresia === Number(this.seleccionMembresiaId));
    if (!membresiaSel) return;

    const fechaInicio = new Date(this.model.fechaInicio + 'T00:00:00');
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + membresiaSel.duracionDias);

    this.model.fechaFin = fechaFin.toISOString().substring(0, 10);
  }

  guardarInscripcion(): void {
    if (!this.seleccionClienteId || !this.seleccionMembresiaId) return;

    const clientSel = this.clientes.find(c => c.idCliente === Number(this.seleccionClienteId));
    const membresiaSel = this.membresias.find(m => m.idMembresia === Number(this.seleccionMembresiaId));

    if (!clientSel || !membresiaSel) return;

    this.model.cliente = clientSel;
    this.model.membresia = membresiaSel;

    if (this.esEdicion && this.model.idInscripcion !== undefined) {
      this.service.actualizar(this.model.idInscripcion, this.model).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error actualizando inscripcion:', err)
      });
    } else {
      this.service.guardar(this.model).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error guardando inscripcion:', err)
      });
    }
  }

  confirmarEliminar(inscripcion: Inscripcion): void {
    this.inscripcionAEliminar = inscripcion;
    this.mostrarModalEliminar = true;
  }

  eliminarInscripcion(): void {
    if (!this.inscripcionAEliminar || this.inscripcionAEliminar.idInscripcion === undefined) return;

    this.service.eliminar(this.inscripcionAEliminar.idInscripcion).subscribe({
      next: () => {
        this.cargarDatos();
        this.mostrarModalEliminar = false;
        this.inscripcionAEliminar = null;
      },
      error: (err) => console.error('Error eliminando inscripcion:', err)
    });
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'activa': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      case 'vencida': return 'badge-warning';
      default: return 'badge-info';
    }
  }
}
