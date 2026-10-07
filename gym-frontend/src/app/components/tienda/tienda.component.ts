import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, ProductoService, VentaCheckoutService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Cliente, MetodoPagoPOS, Producto } from '../../models/gym.models';

interface CartItem { producto: Producto; cantidad: number; }

@Component({
  selector: 'app-tienda', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './tienda.component.html', styleUrl: './tienda.component.css'
})
export class TiendaComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  clientes: Cliente[] = [];
  filtroBusqueda = '';
  seleccionClienteId: number | null = null;
  carrito: CartItem[] = [];
  metodoPago: MetodoPagoPOS = 'EFECTIVO';
  procesandoCompra = false;
  compraMensaje = '';
  compraExito = true;
  clienteActualTexto = '';

  constructor(
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private ventaCheckoutService: VentaCheckoutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void { this.cargarDatos(); }
  esAdmin(): boolean { return this.authService.obtenerRol() === 'ADMIN'; }

  private esClientePropio(cliente: Cliente): boolean {
    return true;
  }

  cargarDatos(): void {
    this.productoService.listar().subscribe({
      next: res => { this.productos=res; this.filtrarProductos(); },
      error: err => console.error('Error cargando productos:', err)
    });
    this.clienteService.listar().subscribe({
      next: res => {
        this.clientes = res.filter(c => c.estado);
        this.asignarClienteActual();
      },
      error: err => console.error('Error cargando clientes:', err)
    });
  }

  private asignarClienteActual(): void {
    if (this.authService.obtenerRol() === 'CLIENTE' && this.clientes.length) {
      const c=this.clientes[0]; this.seleccionClienteId=c.idCliente ?? null;
      this.clienteActualTexto=`${c.nombre} ${c.apellido} (${c.cedula})`;
    }
  }

  imagenProducto(producto: Producto): string {
    const n=(producto.nombre||'').toLowerCase();
    if(n.includes('whey')||n.includes('prote')) return 'assets/img/products/whey.svg';
    if(n.includes('gatorade')||n.includes('bebida')||n.includes('botella')) return 'assets/img/products/gatorade.svg';
    if(n.includes('toalla')) return 'assets/img/products/toalla.svg';
    if(n.includes('guante')) return 'assets/img/products/guantes.svg';
    if(n.includes('shaker')) return 'assets/img/products/shaker.svg';
    if(n.includes('creatina')) return 'assets/img/products/creatina.svg';
    return 'assets/img/products/default.svg';
  }

  filtrarProductos(): void {
    const q=this.filtroBusqueda.toLowerCase().trim();
    this.productosFiltrados=!q ? [...this.productos] : this.productos.filter(p => `${p.nombre} ${p.descripcion}`.toLowerCase().includes(q));
  }

  agregarAlCarrito(producto: Producto): void {
    const actual=this.carrito.find(i=>i.producto.idProducto===producto.idProducto);
    const cantidad=actual?.cantidad||0;
    if(cantidad>=producto.stock){ this.mostrarMensaje(`Stock insuficiente para ${producto.nombre}`,false); return; }
    if(actual) actual.cantidad++; else this.carrito.push({producto,cantidad:1});
  }

  cambiarCantidad(item: CartItem, delta: number): void {
    const nuevo=item.cantidad+delta;
    if(nuevo<=0){this.carrito=this.carrito.filter(i=>i!==item);return;}
    if(nuevo>item.producto.stock){this.mostrarMensaje(`Stock máximo alcanzado para ${item.producto.nombre}`,false);return;}
    item.cantidad=nuevo;
  }

  obtenerTotalCarrito(): number { return this.carrito.reduce((t,i)=>t+(i.producto.precio*i.cantidad),0); }

  confirmarCompra(): void {
    if(!this.carrito.length||!this.seleccionClienteId||this.procesandoCompra) return;
    this.procesandoCompra=true; this.compraMensaje='';
    this.ventaCheckoutService.completarCompra({
      clienteId:Number(this.seleccionClienteId),
      metodoPago:this.metodoPago,
      items:this.carrito.map(i=>({productoId:i.producto.idProducto!,cantidad:i.cantidad}))
    }).subscribe({
      next:()=>{
        this.procesandoCompra=false; this.compraExito=true;
        this.compraMensaje=this.esAdmin()?'Compra registrada. Venta, stock y pago fueron guardados. Imprime el recibo desde el módulo Pagos.':'Compra registrada. Venta, stock y pago PRODUCTO fueron guardados correctamente.';
        this.carrito=[]; if(this.esAdmin()) this.seleccionClienteId=null; this.cargarDatos();
        setTimeout(()=>this.compraMensaje='',5000);
      },
      error:err=>{
        this.procesandoCompra=false; this.compraExito=false;
        this.compraMensaje=err?.error?.message||'No se pudo completar la compra. No se guardaron cambios parciales.';
      }
    });
  }

  private mostrarMensaje(mensaje:string, exito:boolean):void{
    this.compraExito=exito;this.compraMensaje=mensaje;setTimeout(()=>this.compraMensaje='',3500);
  }
}
