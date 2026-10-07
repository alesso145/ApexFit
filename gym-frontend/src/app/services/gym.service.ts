import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Cliente,
  Entrenador,
  Membresia,
  Clase,
  Inscripcion,
  Asistencia,
  Pago,
  Producto,
  Venta,
  DetalleVenta,
  AsistenciaEntrenador,
  MetodoPagoPOS
} from '../models/gym.models';

const API_BASE_URL = 'http://localhost:8081/api';

@Injectable()
export abstract class BaseCrudService<T, ID> {
  protected abstract get baseUrl(): string;

  constructor(protected http: HttpClient) {}

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }

  buscarPorId(id: ID): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  guardar(item: T): Observable<T> {
    return this.http.post<T>(this.baseUrl, item);
  }

  actualizar(id: ID, item: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item);
  }

  eliminar(id: ID): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

@Injectable({
  providedIn: 'root'
})
export class ClienteService extends BaseCrudService<Cliente, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/clientes`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EntrenadorService extends BaseCrudService<Entrenador, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/entrenadores`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MembresiaService extends BaseCrudService<Membresia, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/membresias`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClaseService extends BaseCrudService<Clase, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/clases`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class InscripcionService extends BaseCrudService<Inscripcion, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/inscripciones`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService extends BaseCrudService<Asistencia, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/asistencias`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AsistenciaEntrenadorService extends BaseCrudService<AsistenciaEntrenador, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/asistencias-entrenadores`;
  }
}

export interface PagoMembresiaRequest {
  inscripcionId: number;
  monto: number;
  fechaPago: string;
  metodoPago: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService extends BaseCrudService<Pago, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/pagos`;
  }

  guardarMembresia(request: PagoMembresiaRequest): Observable<Pago> {
    return this.http.post<Pago>(this.baseUrl, request);
  }

  actualizarMembresia(id: number, request: PagoMembresiaRequest): Observable<Pago> {
    return this.http.put<Pago>(`${this.baseUrl}/${id}`, request);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService extends BaseCrudService<Producto, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/productos`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VentaService extends BaseCrudService<Venta, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/ventas`;
  }
}

export interface VentaCheckoutItem {
  productoId: number;
  cantidad: number;
}

export interface VentaCheckoutRequest {
  clienteId: number;
  metodoPago: MetodoPagoPOS;
  items: VentaCheckoutItem[];
}

@Injectable({
  providedIn: 'root'
})
export class VentaCheckoutService {
  private baseUrl = `${API_BASE_URL}/ventas`;

  constructor(private http: HttpClient) {}

  completarCompra(request: VentaCheckoutRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.baseUrl}/checkout`, request);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaService extends BaseCrudService<DetalleVenta, number> {
  protected override get baseUrl(): string {
    return `${API_BASE_URL}/detalles-venta`;
  }
}


@Injectable({
  providedIn: 'root'
})
export class ProductoSoapService {
  private soapUrl = 'http://localhost:8081/ws';

  constructor(private http: HttpClient) {}

  listarProductosSoap(): Observable<string> {
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:prod="http://example.org/gym/productos">
        <soapenv:Header/>
        <soapenv:Body>
          <prod:listarProductosRequest>
            <prod:usuario>proveedor</prod:usuario>
            <prod:password>123456</prod:password>
          </prod:listarProductosRequest>
        </soapenv:Body>
      </soapenv:Envelope>`;

    return this.http.post(this.soapUrl, envelope, {
      responseType: 'text',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
      withCredentials: true
    });
  }

  ingresarStockProveedorSoap(data: { idProducto?: number | null; nombre: string; descripcion?: string; precioUnitario?: number | null; cantidad: number; proveedor?: string; }): Observable<string> {
    const idXml = data.idProducto ? `<prod:idProducto>${data.idProducto}</prod:idProducto>` : '';
    const descXml = data.descripcion ? `<prod:descripcion>${data.descripcion}</prod:descripcion>` : '';
    const precioXml = data.precioUnitario != null ? `<prod:precioUnitario>${data.precioUnitario}</prod:precioUnitario>` : '';
    const proveedorXml = data.proveedor ? `<prod:proveedor>${data.proveedor}</prod:proveedor>` : '';
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:prod="http://example.org/gym/productos">
        <soapenv:Header/>
        <soapenv:Body>
          <prod:registrarIngresoStockRequest>
            <prod:usuario>proveedor</prod:usuario>
            <prod:password>123456</prod:password>
            ${idXml}
            <prod:nombre>${data.nombre}</prod:nombre>
            ${descXml}
            ${precioXml}
            <prod:cantidad>${data.cantidad}</prod:cantidad>
            ${proveedorXml}
          </prod:registrarIngresoStockRequest>
        </soapenv:Body>
      </soapenv:Envelope>`;

    return this.http.post(this.soapUrl, envelope, {
      responseType: 'text',
      headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
      withCredentials: true
    });
  }


}
