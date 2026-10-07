import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  rolActual: string | null = null;
  tiempoSesion = '05:00';
  private timer: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.rolActual = this.authService.obtenerRol();
    this.actualizarTiempoSesion();
    this.timer = setInterval(() => this.actualizarTiempoSesion(), 1000);
  }

  get esAdmin(): boolean {
    return this.puedeVer('ADMIN');
  }

  get esCliente(): boolean {
    return this.puedeVer('CLIENTE');
  }

  puedeVer(...roles: string[]): boolean {
    return this.authService.tieneRol(...roles);
  }

  private actualizarTiempoSesion(): void {
    const ms = this.authService.tiempoRestanteSesionMs();
    const total = Math.ceil(ms / 1000);
    const min = Math.floor(total / 60).toString().padStart(2, '0');
    const sec = Math.max(0, total % 60).toString().padStart(2, '0');
    this.tiempoSesion = `${min}:${sec}`;
    if (total <= 0) this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}