import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, ProductoSoapService } from '../../services/gym.service';
import { Producto } from '../../models/gym.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="flex-between" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2.25rem;">Productos</h1>
          <p style="color: var(--text-secondary);">Inventario y tienda del gimnasio (bebidas, suplementos, accesorios)</p>
        </div>
        <button *ngIf="puedeGestionar()" class="btn btn-primary" (click)="abrirModalAdicion()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.1rem; height: 1.1rem;">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo Producto
        </button>
      </div>


      <div *ngIf="puedeVerSoap()" class="glass-card" style="margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <div>
          <h2 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Área SOAP de Productos</h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem;">Consulta SOAP protegida con la misma cookie del login. Disponible para ADMIN y ENTRENADOR.</p>
        </div>
        <div style="display:flex; gap:.75rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" type="button" (click)="consultarProductosSoap()">SOAP: Ver Stock</button>
          <button class="btn btn-primary" type="button" (click)="abrirSoapStock()">SOAP: Rellenar Stock</button>
        </div>
      </div>

      <div *ngIf="puedeVerSoap() && mostrarSoapStock" class="glass-card" style="margin-bottom: 1.5rem; border-color: rgba(168,85,247,.35);">
        <h2 style="font-size: 1.1rem; margin-bottom: .35rem;">Empresa proveedora externa - Ingreso masivo de stock</h2>
        <p style="color: var(--text-secondary); font-size: .88rem; margin-bottom: 1rem;">Simula una empresa externa que abastece productos al gimnasio usando SOAP. Selecciona un producto existente o escribe uno nuevo.</p>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
          <div class="form-group"><label class="form-label">Producto existente</label><select class="form-control" [(ngModel)]="soapStock.idProducto" (change)="cargarProductoSoapSeleccionado()"><option [ngValue]="null">-- Nuevo producto --</option><option *ngFor="let p of productos" [ngValue]="p.idProducto">{{ p.nombre }} - Stock actual: {{ p.stock }}</option></select></div>
          <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" [(ngModel)]="soapStock.nombre" placeholder="Ej: Proteína Whey"></div>
          <div class="form-group"><label class="form-label">Cantidad a ingresar</label><input type="number" class="form-control" [(ngModel)]="soapStock.cantidad" min="1"></div>
          <div class="form-group"><label class="form-label">Precio unitario</label><input type="number" step="0.01" class="form-control" [(ngModel)]="soapStock.precioUnitario" min="0"></div>
          <div class="form-group"><label class="form-label">Proveedor</label><input class="form-control" [(ngModel)]="soapStock.proveedor" placeholder="Ej: Suplementos Ecuador S.A."></div>
        </div>
        <div class="form-group"><label class="form-label">Descripción</label><input class="form-control" [(ngModel)]="soapStock.descripcion" placeholder="Ingreso por reposición de inventario"></div>
        <button class="btn btn-primary" type="button" (click)="registrarIngresoStockSoap()">Registrar ingreso SOAP</button>
      </div>

      <div *ngIf="puedeVerSoap() && soapMensaje" class="glass-card" style="margin-bottom: 1.5rem; border-color: rgba(99,102,241,0.28);">
        <p style="font-weight: 700; margin-bottom: 0.75rem;">{{ soapMensaje }}</p>
        <div class="table-container" *ngIf="productosSoap.length > 0">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productosSoap">
                <td>{{ p.idProducto }}</td>
                <td>{{ p.nombre }}</td>
                <td>\${{ p.precio | number:'1.2-2' }}</td>
                <td>{{ p.stock }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="glass-card" style="padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem; color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" class="form-control" style="border: none; background: transparent; padding: 0.25rem 0;" 
               placeholder="Buscar por nombre o descripción..." [(ngModel)]="filtroBusqueda" (input)="filtrarProductos()">
      </div>

      <!-- Products Grid -->
      <div class="grid-cols" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <div *ngFor="let p of productosFiltrados" class="glass-card flex-between" style="flex-direction: column; align-items: stretch; gap: 1.25rem; position: relative;">
          
          <!-- Stock Alert Indicator -->
          <div style="position: absolute; top: 0.75rem; right: 0.75rem;">
            <span class="badge" [ngClass]="p.stock > 10 ? 'badge-success' : (p.stock > 0 ? 'badge-warning' : 'badge-danger')">
              Stock: {{ p.stock }}
            </span>
          </div>

          <img class="product-thumb" [src]="imagenProducto(p)" [alt]="p.nombre">
          <div style="margin-top: 0.5rem;">
            <h2 style="font-size: 1.2rem; font-weight: 700; max-width: 70%;">{{ p.nombre }}</h2>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem; min-height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              {{ p.descripcion }}
            </p>
          </div>

          <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; margin-top: auto;">
            <span style="font-size: 1.35rem; font-weight: 800; color: var(--accent-secondary);">\${{ p.precio | number:'1.2-2' }}</span>
            
            <div *ngIf="puedeGestionar()" style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-icon" (click)="abrirModalEdicion(p)" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.9rem; height: 0.9rem;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn btn-danger btn-icon" (click)="confirmarEliminar(p)" title="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 0.9rem; height: 0.9rem;">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="productosFiltrados.length === 0" class="glass-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 4rem;">
          No se encontraron productos en la tienda.
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" [ngClass]="{'active': mostrarModalForm}">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
            <button class="btn btn-secondary btn-icon" style="padding: 0.25rem; border: none; background: transparent;" (click)="cerrarModalForm()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <form (submit)="guardarProducto()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nombre del Producto</label>
                <input type="text" class="form-control" [(ngModel)]="model.nombre" name="nombre" required placeholder="Ej: Bebida Isotónica 500ml">
              </div>
              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3" [(ngModel)]="model.descripcion" name="descripcion" placeholder="Ej: Bebida hidratante sabor a frutas tropicales..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Precio de Venta ($)</label>
                <input type="number" step="0.01" class="form-control" [(ngModel)]="model.precio" name="precio" required min="0" placeholder="Ej: 2.50">
              </div>
              <div class="form-group">
                <label class="form-label">Stock Inicial</label>
                <input type="number" class="form-control" [(ngModel)]="model.stock" name="stock" required min="0" placeholder="Ej: 50">
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
            <p>¿Estás seguro de que deseas eliminar el producto <strong>{{ productoAEliminar?.nombre }}</strong>?</p>
            <p style="color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
              * Esta acción no se puede deshacer y puede afectar historiales de ventas existentes.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="mostrarModalEliminar = false">Cancelar</button>
            <button class="btn btn-danger" (click)="eliminarProducto()">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSoap: Producto[] = [];
  soapMensaje = '';
  filtroBusqueda = '';
  mostrarSoapStock = false;
  soapStock = { idProducto: null as number | null, nombre: '', descripcion: '', precioUnitario: 0, cantidad: 1, proveedor: 'Suplementos Ecuador S.A.' };

  // Modals status
  mostrarModalForm = false;
  mostrarModalEliminar = false;
  esEdicion = false;

  // Active form model
  model: Producto = this.nuevoProducto();
  productoAEliminar: Producto | null = null;

  constructor(
    private service: ProductoService,
    private productoSoapService: ProductoSoapService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  puedeGestionar(): boolean {
    return this.authService.tieneRol('ADMIN');
  }

  puedeVerSoap(): boolean {
    return this.authService.tieneRol('ADMIN', 'ENTRENADOR');
  }

  cargarProductos(): void {
    this.service.listar().subscribe({
      next: (res) => {
        this.productos = res;
        this.filtrarProductos();
      },
      error: (err) => console.error('Error cargando productos:', err)
    });
  }


  imagenProducto(producto: Producto): string {
    const nombre = (producto?.nombre || '').toLowerCase();
    if (nombre.includes('whey') || nombre.includes('prote')) return 'assets/img/products/whey.svg';
    if (nombre.includes('gatorade') || nombre.includes('bebida') || nombre.includes('botella')) return 'assets/img/products/gatorade.svg';
    if (nombre.includes('toalla')) return 'assets/img/products/toalla.svg';
    if (nombre.includes('guante')) return 'assets/img/products/guantes.svg';
    if (nombre.includes('shaker')) return 'assets/img/products/shaker.svg';
    if (nombre.includes('creatina')) return 'assets/img/products/creatina.svg';
    return 'assets/img/products/default.svg';
  }

  filtrarProductos(): void {
    const q = this.filtroBusqueda.toLowerCase().trim();
    if (!q) {
      this.productosFiltrados = [...this.productos];
      return;
    }
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q)
    );
  }

  nuevoProducto(): Producto {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0
    };
  }

  abrirModalAdicion(): void {
    this.esEdicion = false;
    this.model = this.nuevoProducto();
    this.mostrarModalForm = true;
  }

  abrirModalEdicion(producto: Producto): void {
    this.esEdicion = true;
    this.model = { ...producto };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  guardarProducto(): void {
    if (!this.model.nombre || this.model.precio < 0 || this.model.stock < 0) return;

    if (this.esEdicion && this.model.idProducto !== undefined) {
      this.service.actualizar(this.model.idProducto, this.model).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error actualizando producto:', err)
      });
    } else {
      this.service.guardar(this.model).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModalForm();
        },
        error: (err) => console.error('Error guardando producto:', err)
      });
    }
  }


  abrirSoapStock(): void {
    this.mostrarSoapStock = !this.mostrarSoapStock;
  }

  cargarProductoSoapSeleccionado(): void {
    const producto = this.productos.find(p => p.idProducto === this.soapStock.idProducto);
    if (producto) {
      this.soapStock.nombre = producto.nombre;
      this.soapStock.descripcion = producto.descripcion;
      this.soapStock.precioUnitario = producto.precio;
    }
  }

  registrarIngresoStockSoap(): void {
    if (!this.soapStock.nombre || this.soapStock.cantidad <= 0) {
      this.soapMensaje = 'Completa nombre y cantidad mayor a cero para ingresar stock por SOAP.';
      return;
    }
    this.soapMensaje = 'Registrando ingreso masivo de stock por SOAP...';
    this.productoSoapService.ingresarStockProveedorSoap(this.soapStock).subscribe({
      next: () => {
        this.soapMensaje = `SOAP registró stock correctamente desde ${this.soapStock.proveedor || 'proveedor externo'}.`;
        this.cargarProductos();
        this.consultarProductosSoap();
      },
      error: (err) => {
        console.error('Error ingreso stock SOAP:', err);
        this.soapMensaje = 'No se pudo registrar el ingreso SOAP. Verifica backend, sesión y permisos.';
      }
    });
  }

  consultarProductosSoap(): void {
    this.soapMensaje = 'Consultando productos por SOAP...';
    this.productosSoap = [];

    this.productoSoapService.listarProductosSoap().subscribe({
      next: (xml) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'text/xml');
        const productos = Array.from(doc.getElementsByTagName('tns:producto'));
        const productosSinPrefijo = Array.from(doc.getElementsByTagName('producto'));
        const nodos = productos.length ? productos : productosSinPrefijo;

        this.productosSoap = nodos.map((node: any) => ({
          idProducto: Number(this.leerXml(node, 'idProducto')),
          nombre: this.leerXml(node, 'nombre'),
          descripcion: this.leerXml(node, 'descripcion'),
          precio: Number(this.leerXml(node, 'precio')),
          stock: Number(this.leerXml(node, 'stock'))
        }));

        this.soapMensaje = this.productosSoap.length
          ? `SOAP respondió correctamente: ${this.productosSoap.length} producto(s).`
          : 'SOAP respondió correctamente, pero no hay productos registrados.';
      },
      error: (err) => {
        console.error('Error SOAP productos:', err);
        this.soapMensaje = 'No se pudo consultar SOAP. Verifica que el backend esté activo y que el usuario tenga rol ADMIN o ENTRENADOR.';
      }
    });
  }

  private leerXml(node: Element, tag: string): string {
    const conPrefijo = node.getElementsByTagName(`tns:${tag}`)[0];
    const sinPrefijo = node.getElementsByTagName(tag)[0];
    return (conPrefijo || sinPrefijo)?.textContent || '';
  }

  confirmarEliminar(producto: Producto): void {
    this.productoAEliminar = producto;
    this.mostrarModalEliminar = true;
  }

  eliminarProducto(): void {
    if (!this.productoAEliminar || this.productoAEliminar.idProducto === undefined) return;

    this.service.eliminar(this.productoAEliminar.idProducto).subscribe({
      next: () => {
        this.cargarProductos();
        this.mostrarModalEliminar = false;
        this.productoAEliminar = null;
      },
      error: (err) => console.error('Error eliminando producto:', err)
    });
  }
}
