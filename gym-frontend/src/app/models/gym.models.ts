export interface Cliente {
  idCliente?: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fechaRegistro?: string; // Format: YYYY-MM-DD
  estado: boolean;
  authUserId?: number;
  username?: string;
  password?: string;
}

export interface Entrenador {
  idEntrenador?: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: string;
  authUserId?: number;
  username?: string;
  password?: string;
}

export interface Membresia {
  idMembresia?: number;
  nombre: string;
  descripcion: string;
  duracionDias: number;
  precio: number;
}

export interface Clase {
  idClase?: number;
  entrenador: Entrenador;
  nombre: string;
  descripcion: string;
  horario: string;
  aula?: string;
  cupoMaximo: number;
}

export interface Inscripcion {
  idInscripcion?: number;
  cliente: Cliente;
  membresia: Membresia;
  fechaInicio: string; // Format: YYYY-MM-DD
  fechaFin: string;    // Format: YYYY-MM-DD
  estado: string;      // Activa, Vencida, Cancelada, etc.
}

export interface Asistencia {
  idAsistencia?: number;
  cliente: Cliente;
  clase: Clase;
  fechaAsistencia: string; // Format: YYYY-MM-DD
}

export interface AsistenciaEntrenador {
  idAsistenciaEntrenador?: number;
  entrenador: Entrenador;
  clase: Clase;
  fechaAsistencia: string;
  horaEntrada?: string;
  horaSalida?: string;
  tiempoMinutos?: number;
}

export type TipoPago = 'MEMBRESIA' | 'PRODUCTO';
export type MetodoPagoPOS = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';

export interface Pago {
  idPago?: number;
  tipoPago?: TipoPago;
  inscripcion?: Inscripcion;
  venta?: Venta;
  monto: number;
  fechaPago: string;       // Format: YYYY-MM-DD
  metodoPago: string;      // Efectivo, Tarjeta, Transferencia, etc.
  estado: string;          // Completado, Pendiente, Reembolsado, etc.
}

export interface Producto {
  idProducto?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

export interface Venta {
  idVenta?: number;
  cliente: Cliente;
  fechaVenta: string;      // Format: YYYY-MM-DD
  total: number;
}

export interface DetalleVenta {
  idDetalle?: number;
  venta?: Venta;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
