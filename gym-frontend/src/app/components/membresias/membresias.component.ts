import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MembresiaService } from '../../services/gym.service';
import { Membresia } from '../../models/gym.models';

@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Membresías</h1>
          <p style="color: var(--text-secondary);">Administración de planes y membresías de suscripción</p>
        </div>
        <button class="btn btn-primary" (click)="abrirModalAdicion()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Membresía
        </button>
      </div>

      <!-- Plans Grid -->
      <div class="grid-cols" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        <div *ngFor="let m of membresias" class="glass-card flex-between" style="flex-direction: column; align-items: stretch; gap: 1.5rem; position: relative; overflow: hidden;">
          
          <!-- Accent decoration line -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--accent-gradient);"></div>
          
          <div>
            <div class="flex-between">
              <h2 style="font-size: 1.35rem; font-weight: 700;">{{ m.nombre }}</h2>
              <span class="badge badge-info" style="font-size: 0.8rem;">{{ m.duracionDias }} Días</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.75rem; min-height: 50px;">
              {{ m.descripcion }}
            </p>
          </div>

          <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 600; text-transform: uppercase;">Precio</span>
              <span style="font-size: 1.75rem; font-weight: 800; color: var(--success); line-height: 1;">\${{ m.precio | number:'1.2-2' }}</span>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-icon" (click)="abrirModalEdicion(m)" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn btn-danger btn-icon" (click)="confirmarEliminar(m)" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.95rem; height: 0.95rem;">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="membresias.length === 0" class="glass-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">
          No hay planes de membresías registrados. ¡Haz clic en "Nueva Membresía" para comenzar!
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" [ngClass]="{'active': mostrarModalForm}">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ esEdicion ? 'Editar Membresía' : 'Nueva Membresía' }}</h3>
            <button class="btn btn-secondary btn-icon" style="padding: 0.25rem; border: none; background: transparent;" (click)="cerrarModalForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form (submit)="guardarMembresia()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nombre del Plan</label>
                <input type="text" class="form-control" [(ngModel)]="model.nombre" name="nombre" required placeholder="Ej: Pase Mensual VIP">
              </div>
              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3" [(ngModel)]="model.descripcion" name="descripcion" placeholder="Ej: Acceso completo a sala de pesas y clases grupales..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Duración (en Días)</label>
                <input type="number" class="form-control" [(ngModel)]="model.duracionDias" name="duracionDias" required min="1" placeholder="Ej: 30">
              </div>
              <div class="form-group">
                <label class="form-label">Precio ($)</label>
                <input type="number" step="0.01" class="form-control" [(ngModel)]="model.precio" name="precio" required min="0" placeholder="Ej: 45.00">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary">
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
            <p>¿Estás seguro de que deseas eliminar la membresía <strong>{{ membresiaAEliminar?.nombre }}</strong>?</p>
            <p style="color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
              * Esta acción no se puede deshacer y puede afectar a los clientes inscritos en este plan.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalEliminar = false">Cancelar</button>
            <button class="btn btn-danger" (click)="eliminarMembresia()">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MembresiasComponent implements OnInit {
  membresias: Membresia[] = [];

  // Modals status
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;

  // Active form model
  model: Membresia = this.nuevaMembresia();
  membresiaAEliminar: Membresia | null = null;

  constructor(private service: MembresiaService) {}

  ngOnInit(): void {
    this.cargarMembresias();
  }

  cargarMembresias(): void {
    this.service.listar().subscribe({
      next: (res) => {
        this.membresias = res;
      },
      error: (err) => console.error('Error cargando membresias:', err)
    });
  }

  nuevaMembresia(): Membresia {
    return {
      nombre: '',
      descripcion: '',
      duracionDias: 30,
      precio: 0
    };
  }

  abrirModalAdicion(): void {
    this.esEdicion = false;
    this.model = this.nuevaMembresia();
    this.mostrarModalForm = true;
  }

  abrirModalEdicion(membresia: Membresia): void {
    this.esEdicion = true;
    this.model = { ...membresia };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarMembresia(): void {
    if (!this.model.nombre || this.model.duracionDias <= 0 || this.model.precio < 0) return;

    if (this.esEdicion && this.model.idMembresia !== undefined) {
      this.service.actualizar(this.model.idMembresia, this.model).subscribe({
        next: () => {
          this.cargarMembresias();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error actualizando membresia:', err)
      });
    } else {
      this.service.guardar(this.model).subscribe({
        next: () => {
          this.cargarMembresias();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error guardando membresia:', err)
      });
    }
  }

  confirmarEliminar(membresia: Membresia): void {
    this.membresiaAEliminar = membresia;
    this.mostrarModalEliminar = true;
  }

  eliminarMembresia(): void {
    if (!this.membresiaAEliminar || this.membresiaAEliminar.idMembresia === undefined) return;

    this.service.eliminar(this.membresiaAEliminar.idMembresia).subscribe({
      next: () => {
        this.cargarMembresias();
        this.mostrarModalEliminar = false;
        this.membresiaAEliminar = null;
      },
      error: (err) => console.error('Error eliminando membresia:', err)
    });
  }
}
