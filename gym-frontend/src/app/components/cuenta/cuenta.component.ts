import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2.25rem;">Mi Cuenta</h1>
        <p style="color: var(--text-secondary);">Administra la seguridad de tu acceso a APEX FIT</p>
      </div>

      <div class="glass-card" style="max-width: 520px;">
        <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="width:3.2rem; height:3.2rem; border-radius:50%; background: var(--accent-gradient); display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:700;">
            {{ inicial }}
          </div>
          <div>
            <div style="font-weight:700; font-size:1.1rem;">{{ usuario }}</div>
            <span class="badge badge-info">{{ rol }}</span>
          </div>
        </div>

        <h2 style="font-size: 1.15rem; margin-bottom: 1rem;">Cambiar contraseña</h2>

        <form (ngSubmit)="guardar()">
          <div class="form-group">
            <label class="form-label">Contraseña actual</label>
            <input [type]="ver ? 'text' : 'password'" class="form-control" name="actual" [(ngModel)]="claveActual" autocomplete="current-password" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nueva contraseña (mínimo 6 caracteres)</label>
            <input [type]="ver ? 'text' : 'password'" class="form-control" name="nueva" [(ngModel)]="nuevaClave" autocomplete="new-password" required>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar nueva contraseña</label>
            <input [type]="ver ? 'text' : 'password'" class="form-control" name="confirmar" [(ngModel)]="confirmar" autocomplete="new-password" required>
          </div>

          <label style="display:flex; align-items:center; gap:0.5rem; color: var(--text-secondary); font-size:0.85rem; margin-bottom:1rem; cursor:pointer;">
            <input type="checkbox" [(ngModel)]="ver" name="ver"> Mostrar contraseñas
          </label>

          <div *ngIf="mensaje" class="badge" style="display:block; padding:0.75rem 1rem; margin-bottom:1rem; white-space: normal;"
               [ngClass]="exito ? 'badge-success' : 'badge-danger'">{{ mensaje }}</div>

          <button type="submit" class="btn btn-primary" style="width:100%;" [disabled]="guardando">
            {{ guardando ? 'Guardando...' : 'Actualizar contraseña' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class CuentaComponent {
  claveActual = '';
  nuevaClave = '';
  confirmar = '';
  ver = false;
  guardando = false;
  mensaje = '';
  exito = true;

  constructor(private authService: AuthService) {}

  get usuario(): string { return this.authService.obtenerUsuario(); }
  get rol(): string { return this.authService.obtenerRol() || ''; }
  get inicial(): string { return (this.usuario || '?').charAt(0).toUpperCase(); }

  guardar(): void {
    this.mensaje = '';
    if (!this.claveActual || !this.nuevaClave || !this.confirmar) {
      return this.mostrar('Completa todos los campos.', false);
    }
    if (this.nuevaClave.length < 6) {
      return this.mostrar('La nueva contraseña debe tener al menos 6 caracteres.', false);
    }
    if (this.nuevaClave !== this.confirmar) {
      return this.mostrar('La confirmación no coincide con la nueva contraseña.', false);
    }
    if (this.nuevaClave === this.claveActual) {
      return this.mostrar('La nueva contraseña debe ser diferente a la actual.', false);
    }

    this.guardando = true;
    this.authService.cambiarClave(this.claveActual, this.nuevaClave).subscribe({
      next: (res) => {
        this.guardando = false;
        this.claveActual = this.nuevaClave = this.confirmar = '';
        this.mostrar(res?.message || 'Contraseña actualizada correctamente.', true);
      },
      error: (err) => {
        this.guardando = false;
        this.mostrar(err?.error?.message || 'No se pudo cambiar la contraseña.', false);
      }
    });
  }

  private mostrar(texto: string, exito: boolean): void {
    this.mensaje = texto;
    this.exito = exito;
  }
}
