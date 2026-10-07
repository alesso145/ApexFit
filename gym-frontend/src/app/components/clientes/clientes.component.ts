import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, EntrenadorService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Cliente, Entrenador } from '../../models/gym.models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  entrenadoresStaff: Entrenador[] = [];
  filtroBusqueda = '';
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;
  model: Cliente = this.nuevoCliente();
  clienteAEliminar: Cliente | null = null;
  mensajeError = '';

  constructor(
    private service: ClienteService,
    private entrenadorService: EntrenadorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarStaffEntrenadores();
  }

  cargarStaffEntrenadores(): void {
    this.entrenadorService.listar().subscribe({
      next: res => this.entrenadoresStaff = res,
      error: err => console.error('Error cargando staff:', err)
    });
  }

  cargarClientes(): void {
    this.service.listar().subscribe({
      next: res => {
        this.clientes = this.filtrarPorRol(res);
        this.filtrarClientes();
      },
      error: err => console.error('Error cargando clientes:', err)
    });
  }

  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }

  private filtrarPorRol(clientes: Cliente[]): Cliente[] {
    return clientes;
  }

  filtrarClientes(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    this.clientesFiltrados = !q ? [...this.clientes] : this.clientes.filter(c =>
      `${c.nombre} ${c.apellido} ${c.cedula} ${c.correo} ${c.username || ''}`.toLowerCase().includes(q)
    );
  }

  nuevoCliente(): Cliente {
    return {
      cedula: '', nombre: '', apellido: '', telefono: '', correo: '', estado: true,
      username: '', password: ''
    };
  }

  abrirModalAdicion(): void {
    if (!this.esAdmin()) return;
    this.mensajeError = '';
    this.esEdicion = false;
    this.model = this.nuevoCliente();
    this.mostrarModalForm = true;
  }

  abrirModalEdicion(cliente: Cliente): void {
    if (!this.esAdmin()) return;
    this.mensajeError = '';
    this.esEdicion = true;
    this.model = { ...cliente, password: '' };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void { this.mostrarModalForm = false; }

  guardarCliente(): void {
    if (!this.esAdmin()) {
      this.mensajeError = 'Solo un administrador puede gestionar clientes.';
      return;
    }

    const cedula = this.model.cedula?.trim();
    const nombre = this.model.nombre?.trim();
    const apellido = this.model.apellido?.trim();
    const username = this.model.username?.trim();
    const password = this.model.password?.trim() || '';

    if (!cedula || !nombre || !apellido || !username) {
      this.mensajeError = 'Cédula, nombre, apellido y username son obligatorios.';
      return;
    }
    if (!this.esEdicion && password.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.esEdicion && this.model.authUserId == null && password.length < 6) {
      this.mensajeError = 'Este cliente no tiene cuenta asociada. Para crearla, ingresa una contraseña de al menos 6 caracteres.';
      return;
    }

    const payload: Cliente = {
      ...this.model, cedula, nombre, apellido, username,
      password: password || undefined
    };

    const request$ = this.esEdicion && this.model.idCliente !== undefined
      ? this.service.actualizar(this.model.idCliente, payload)
      : this.service.guardar(payload);

    request$.subscribe({
      next: () => { this.mensajeError = ''; this.cargarClientes(); this.cerrarModalForm(); },
      error: err => {
        console.error('Error guardando cliente:', err);
        this.mensajeError = this.obtenerMensajeError(err, 'No se pudo guardar el cliente.');
      }
    });
  }

  private obtenerMensajeError(err: any, fallback: string): string {
    return err?.error?.message || err?.error?.error || err?.message || fallback;
  }

  confirmarEliminar(cliente: Cliente): void {
    if (!this.esAdmin()) return;
    this.mensajeError = '';
    this.clienteAEliminar = cliente;
    this.mostrarModalEliminar = true;
  }

  eliminarCliente(): void {
    if (this.clienteAEliminar?.idCliente === undefined) return;
    this.service.eliminar(this.clienteAEliminar.idCliente).subscribe({
      next: () => {
        this.cargarClientes();
        this.mostrarModalEliminar = false;
        this.clienteAEliminar = null;
      },
      error: err => console.error('Error eliminando cliente:', err)
    });
  }
}
