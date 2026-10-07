import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const AUTH_URL = 'http://localhost:8081/api/auth';
const CUENTA_URL = 'http://localhost:8081/api/cuenta';

export type RolUsuario = 'ADMIN' | 'CLIENTE' | 'ENTRENADOR' | null;

export interface AuthResponse {
  autenticado: boolean;
  username: string | null;
  role?: RolUsuario;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_MS = 5 * 60 * 1000;
  private logoutTimer: any = null;

  private loggedInSubject = new BehaviorSubject<boolean>(localStorage.getItem('gym_logged') === 'true');
  private roleSubject = new BehaviorSubject<RolUsuario>((localStorage.getItem('gym_role') as RolUsuario) || null);

  loggedIn$ = this.loggedInSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.estaLogueado()) {
      this.programarCierreAutomatico();
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_URL}/login`, { username, password }, { withCredentials: true })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  registrar(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_URL}/register`, { username, password }, { withCredentials: true })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  /** Recuperación pública de clave: verifica usuario + cédula (CLIENTE / ENTRENADOR). */
  recuperarClave(username: string, cedula: string, nuevaClave: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${AUTH_URL}/recuperar-clave`, { username, cedula, nuevaClave });
  }

  /** Cambio de clave del usuario autenticado. */
  cambiarClave(claveActual: string, nuevaClave: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${CUENTA_URL}/cambiar-clave`, { claveActual, nuevaClave });
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_URL}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.limpiarSesion()));
  }

  estaLogueado(): boolean {
    const logged = localStorage.getItem('gym_logged') === 'true';
    const expiresAt = Number(localStorage.getItem('gym_session_expires') || '0');
    if (!logged) return false;
    if (!expiresAt || Date.now() > expiresAt) {
      this.limpiarSesion();
      return false;
    }
    return true;
  }

  tiempoRestanteSesionMs(): number {
    const expiresAt = Number(localStorage.getItem('gym_session_expires') || '0');
    return Math.max(0, expiresAt - Date.now());
  }

  obtenerRol(): RolUsuario {
    return (localStorage.getItem('gym_role') as RolUsuario) || null;
  }

  obtenerUsuario(): string {
    return localStorage.getItem('gym_user') || '';
  }

  tieneRol(...roles: string[]): boolean {
    const rolActual = this.obtenerRol();
    return !!rolActual && roles.includes(rolActual);
  }

  limpiarSesion(): void {
    localStorage.removeItem('gym_logged');
    localStorage.removeItem('gym_user');
    localStorage.removeItem('gym_role');
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_session_expires');
    if (this.logoutTimer) { clearTimeout(this.logoutTimer); this.logoutTimer = null; }
    this.loggedInSubject.next(false);
    this.roleSubject.next(null);
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('gym_logged', 'true');
    localStorage.setItem('gym_user', res.username || '');
    localStorage.setItem('gym_role', res.role || 'CLIENTE');
    if (res.token) {
      localStorage.setItem('gym_token', res.token);
    }
    localStorage.setItem('gym_session_expires', String(Date.now() + this.SESSION_MS));
    this.programarCierreAutomatico();
    this.loggedInSubject.next(true);
    this.roleSubject.next(res.role || 'CLIENTE');
  }

  private programarCierreAutomatico(): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    const restante = this.tiempoRestanteSesionMs();
    if (restante <= 0) {
      this.limpiarSesion();
      return;
    }
    this.logoutTimer = setTimeout(() => this.limpiarSesion(), restante);
  }
}

