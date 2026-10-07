import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntrenadorService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Entrenador } from '../../models/gym.models';

@Component({
  selector: 'app-entrenadores', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './entrenadores.component.html', styleUrl: './entrenadores.component.css'
})
export class EntrenadoresComponent implements OnInit {
  entrenadores: Entrenador[] = [];
  entrenadoresFiltrados: Entrenador[] = [];
  filtroBusqueda = '';
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;
  model: Entrenador = this.nuevoEntrenador();
  entrenadorAEliminar: Entrenador | null = null;
  mensajeError = '';

  constructor(private service: EntrenadorService, private authService: AuthService) {}
  ngOnInit(): void { this.cargarEntrenadores(); }

  cargarEntrenadores(): void {
    this.service.listar().subscribe({
      next: res => { this.entrenadores = this.filtrarPorRol(res); this.filtrarEntrenadores(); },
      error: err => console.error('Error cargando entrenadores:', err)
    });
  }

  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }

  private filtrarPorRol(entrenadores: Entrenador[]): Entrenador[] {
    return entrenadores;
  }

  filtrarEntrenadores(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    this.entrenadoresFiltrados = !q ? [...this.entrenadores] : this.entrenadores.filter(e =>
      `${e.nombre} ${e.apellido} ${e.especialidad} ${e.cedula} ${e.username || ''}`.toLowerCase().includes(q));
  }

  nuevoEntrenador(): Entrenador {
    return { cedula:'', nombre:'', apellido:'', telefono:'', especialidad:'', username:'', password:'' };
  }

  abrirModalAdicion(): void { if (!this.esAdmin()) return; this.mensajeError=''; this.esEdicion=false; this.model=this.nuevoEntrenador(); this.mostrarModalForm=true; }
  abrirModalEdicion(entrenador: Entrenador): void { if (!this.esAdmin()) return; this.mensajeError=''; this.esEdicion=true; this.model={...entrenador,password:''}; this.mostrarModalForm=true; }
  cerrarModalForm(): void { this.mostrarModalForm=false; }

  guardarEntrenador(): void {
    if (!this.esAdmin()) {
      this.mensajeError = 'Solo un administrador puede gestionar entrenadores.';
      return;
    }

    const cedula = this.model.cedula?.trim();
    const nombre = this.model.nombre?.trim();
    const apellido = this.model.apellido?.trim();
    const especialidad = this.model.especialidad?.trim();
    const username = this.model.username?.trim();
    const password = this.model.password?.trim() || '';

    if (!cedula || !nombre || !apellido || !especialidad || !username) {
      this.mensajeError = 'Cédula, nombre, apellido, especialidad y username son obligatorios.';
      return;
    }
    if (!this.esEdicion && password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.esEdicion && this.model.authUserId == null && password.length < 6) {
      this.mensajeError = 'Este entrenador no tiene cuenta asociada. Para crearla, ingresa una contraseña de al menos 6 caracteres.';
      return;
    }

    const payload: Entrenador = {
      ...this.model, cedula, nombre, apellido, especialidad, username,
      password: password || undefined
    };

    const request$ = this.esEdicion && this.model.idEntrenador !== undefined
      ? this.service.actualizar(this.model.idEntrenador, payload)
      : this.service.guardar(payload);

    request$.subscribe({
      next: () => { this.mensajeError=''; this.cargarEntrenadores(); this.cerrarModalForm(); },
      error: err => {
        console.error('Error guardando entrenador:', err);
        this.mensajeError = this.obtenerMensajeError(err, 'No se pudo guardar el entrenador.');
      }
    });
  }

  private obtenerMensajeError(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || err?.message || fallback;
  }

  confirmarEliminar(entrenador: Entrenador): void { if (!this.esAdmin()) return; this.mensajeError=''; this.entrenadorAEliminar=entrenador; this.mostrarModalEliminar=true; }
  eliminarEntrenador(): void {
    if (this.entrenadorAEliminar?.idEntrenador===undefined) return;
    this.service.eliminar(this.entrenadorAEliminar.idEntrenador).subscribe({
      next:()=>{this.cargarEntrenadores();this.mostrarModalEliminar=false;this.entrenadorAEliminar=null}, error:err=>console.error('Error eliminando entrenador:',err)
    });
  }
}
