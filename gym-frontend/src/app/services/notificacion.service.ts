import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const NOTIF_URL = 'http://localhost:8081/api/notificaciones';

export interface Notificacion {
  idNotificacion: number;
  tipo: 'VENTA' | 'CLASE' | 'INSCRIPCION' | 'SEGURIDAD' | 'INFO' | string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(NOTIF_URL);
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.post<void>(`${NOTIF_URL}/${id}/leer`, {});
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.post<void>(`${NOTIF_URL}/leer-todas`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${NOTIF_URL}/${id}`);
  }

  eliminarTodas(): Observable<void> {
    return this.http.delete<void>(NOTIF_URL);
  }
}
