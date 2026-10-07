import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  cargando = false;
  error = '';
  exito = '';

  // Recuperación de contraseña
  recuperando = false;
  recUsername = '';
  recCedula = '';
  recNueva = '';
  recConfirmar = '';

  constructor(private authService: AuthService, private router: Router) {}

  ingresar(): void {
    this.error = '';
    this.exito = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Ingrese usuario y contraseña.';
      return;
    }

    this.cargando = true;
    const peticion = this.authService.login(this.username, this.password);

    peticion.subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'Usuario o contraseña incorrectos.';
      }
    });
  }

  abrirRecuperacion(event: Event): void {
    event.preventDefault();
    this.error = '';
    this.exito = '';
    this.recUsername = this.username;
    this.recCedula = this.recNueva = this.recConfirmar = '';
    this.recuperando = true;
  }

  volverAlLogin(event?: Event): void {
    event?.preventDefault();
    this.error = '';
    this.recuperando = false;
  }

  recuperar(): void {
    this.error = '';

    if (!this.recUsername.trim() || !this.recCedula.trim() || !this.recNueva || !this.recConfirmar) {
      this.error = 'Completa todos los campos.';
      return;
    }
    if (this.recNueva.length < 6) {
      this.error = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.recNueva !== this.recConfirmar) {
      this.error = 'La confirmación no coincide con la nueva contraseña.';
      return;
    }

    this.cargando = true;
    this.authService.recuperarClave(this.recUsername.trim(), this.recCedula.trim(), this.recNueva).subscribe({
      next: (res) => {
        this.cargando = false;
        this.username = this.recUsername.trim();
        this.password = '';
        this.recuperando = false;
        this.exito = res?.message || 'Contraseña restablecida. Ya puedes iniciar sesión.';
      },
      error: (err) => {
        this.cargando = false;
        this.error = err?.error?.message || 'No se pudo restablecer la contraseña.';
      }
    });
  }
}
