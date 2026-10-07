import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaseService, EntrenadorService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Clase, Entrenador } from '../../models/gym.models';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Clases</h1>
          <p style="color: var(--text-secondary);">Coordinación de clases y horarios del gimnasio</p>
        </div>
        <button class="btn btn-primary" *ngIf="esAdmin()" (click)="abrirModalAdicion()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Clase
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="form-control" style="border: none; background: transparent; padding: 0.25rem 0;" 
               placeholder="Buscar por nombre de clase, horario o entrenador..." [(ngModel)]="filtroBusqueda" (input)="filtrarClases()">
      </div>

      <!-- Classes Table -->
      <div class="glass-card" style="padding: 0;">
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Clase</th>
                <th>Descripción</th>
                <th>Horario</th>
                <th>Área / Aula</th>
                <th>Cupo Máximo</th>
                <th>Entrenador Responsable</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cl of clasesFiltradas">
                <td><strong style="color: var(--accent-primary);">{{ cl.nombre }}</strong></td>
                <td>{{ cl.descripcion }}</td>
                <td>
                  <span class="badge badge-info" style="font-size: 0.8rem;">
                    {{ cl.horario }}
                  </span>
                </td>
                <td>{{ cl.aula || 'Sin aula asignada' }}</td>
                <td>
                  <span class="flex-align-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem; color: var(--text-muted);">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4"/>
                    </svg>
                    {{ cl.cupoMaximo }} pers.
                  </span>
                </td>
                <td>
                  <strong *ngIf="cl.entrenador">{{ cl.entrenador.nombre }} {{ cl.entrenador.apellido }}</strong>
                  <span *ngIf="!cl.entrenador" style="color: var(--text-muted);">Sin asignar</span>
                </td>
                <td style="text-align: right;">
                  <div *ngIf="esAdmin(); else soloLecturaClase" style="display: inline-flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-secondary btn-icon" (click)="abrirModalEdicion(cl)" title="Editar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn btn-danger btn-icon" (click)="confirmarEliminar(cl)" title="Eliminar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                  <ng-template #soloLecturaClase><span style="color: var(--text-muted);">Solo lectura</span></ng-template>
                </td>
              </tr>
              <tr *ngIf="clasesFiltradas.length === 0">
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                  No se encontraron clases.
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
            <h3>{{ esEdicion ? 'Editar Clase' : 'Nueva Clase' }}</h3>
            <button class="btn btn-secondary btn-icon" style="padding: 0.25rem; border: none; background: transparent;" (click)="cerrarModalForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form (submit)="guardarClase()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nombre de la Clase</label>
                <input type="text" class="form-control" [(ngModel)]="model.nombre" name="nombre" required placeholder="Ej: Spinning Pro">
              </div>
              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3" [(ngModel)]="model.descripcion" name="descripcion" placeholder="Ej: Sesión intensa de ciclismo estacionario orientada a la resistencia física..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Horario</label>
                <input type="text" class="form-control" [(ngModel)]="model.horario" name="horario" required placeholder="Ej: Lunes y Miércoles 19:00 - 20:00">
              </div>
              <div class="form-group">
                <label class="form-label">Área / Aula</label>
                <input type="text" class="form-control" [(ngModel)]="model.aula" name="aula" placeholder="Ej: Área de Pesas A1">
              </div>
              <div class="form-group">
                <label class="form-label">Cupo Máximo (Participantes)</label>
                <input type="number" class="form-control" [(ngModel)]="model.cupoMaximo" name="cupoMaximo" required min="1" placeholder="Ej: 20">
              </div>
              <div class="form-group">
                <label class="form-label">Entrenador Responsable</label>
                <select class="form-control" [(ngModel)]="seleccionEntrenadorId" name="entrenadorId" required>
                  <option [value]="null" disabled selected>-- Seleccionar Entrenador --</option>
                  <option *ngFor="let ent of entrenadores" [value]="ent.idEntrenador">
                    {{ ent.nombre }} {{ ent.apellido }} ({{ ent.especialidad }})
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="!seleccionEntrenadorId">
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
            <p>¿Estás seguro de que deseas eliminar la clase <strong>{{ claseAEliminar?.nombre }}</strong>?</p>
            <p style="color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
              * Esta acción eliminará el registro de clase y todas las asistencias asociadas.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalEliminar = false">Cancelar</button>
            <button class="btn btn-danger" (click)="eliminarClase()">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  clasesFiltradas: Clase[] = [];
  filtroBusqueda = '';

  // Dropdown list
  entrenadores: Entrenador[] = [];
  seleccionEntrenadorId: number | null = null;

  // Modals status
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;

  // Active form model
  model: Clase = this.nuevaClase();
  claseAEliminar: Clase | null = null;

  constructor(
    private service: ClaseService,
    private entrenadorService: EntrenadorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Clases
    this.service.listar().subscribe({
      next: (res) => {
        this.clases = this.filtrarPorRol(res);
        this.filtrarClases();
      },
      error: (err) => console.error('Error cargando clases:', err)
    });

    // Entrenadores
    this.entrenadorService.listar().subscribe({
      next: (res) => {
        this.entrenadores = res;
      },
      error: (err) => console.error('Error cargando entrenadores:', err)
    });
  }

  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }

  private filtrarPorRol(clases: Clase[]): Clase[] {
    return clases;
  }

  filtrarClases(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) {
      this.clasesFiltradas = [...this.clases];
      return;
    }
    this.clasesFiltradas = this.clases.filter(cl =>
      cl.nombre.toLowerCase().includes(q) ||
      cl.horario.toLowerCase().includes(q) ||
      (cl.entrenador && (cl.entrenador.nombre + ' ' + cl.entrenador.apellido).toLowerCase().includes(q))
    );
  }

  nuevaClase(): Clase {
    return {
      nombre: '',
      descripcion: '',
      horario: '',
      cupoMaximo: 15,
      entrenador: {} as Entrenador
    };
  }

  abrirModalAdicion(): void {
    this.esEdicion = false;
    this.model = this.nuevaClase();
    this.seleccionEntrenadorId = null;
    this.mostrarModalForm = true;
  }

  abrirModalEdicion(clase: Clase): void {
    this.esEdicion = true;
    this.model = { ...clase };
    this.seleccionEntrenadorId = clase.entrenador?.idEntrenador ?? null;
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarClase(): void {
    if (!this.model.nombre || !this.model.horario || !this.seleccionEntrenadorId) return;

    const entrenadorSel = this.entrenadores.find(e => e.idEntrenador === Number(this.seleccionEntrenadorId));
    if (!entrenadorSel) return;

    this.model.entrenador = entrenadorSel;

    if (this.esEdicion && this.model.idClase !== undefined) {
      this.service.actualizar(this.model.idClase, this.model).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error actualizando clase:', err)
      });
    } else {
      this.service.guardar(this.model).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error guardando clase:', err)
      });
    }
  }

  confirmarEliminar(clase: Clase): void {
    this.claseAEliminar = clase;
    this.mostrarModalEliminar = true;
  }

  eliminarClase(): void {
    if (!this.claseAEliminar || this.claseAEliminar.idClase === undefined) return;

    this.service.eliminar(this.claseAEliminar.idClase).subscribe({
      next: () => {
        this.cargarDatos();
        this.mostrarModalEliminar = false;
        this.claseAEliminar = null;
      },
      error: (err) => console.error('Error eliminando clase:', err)
    });
  }
}
