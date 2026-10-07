import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionService, PagoService, DetalleVentaService } from '../../services/gym.service';
import { AuthService } from '../../services/auth.service';
import { Pago, Inscripcion, DetalleVenta } from '../../models/gym.models';

@Component({
  selector: 'app-pagos', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './pagos.component.html', styleUrl: './pagos.component.css'
})
export class PagosComponent implements OnInit {
  pagos: Pago[]=[]; pagosFiltrados: Pago[]=[]; inscripciones: Inscripcion[]=[]; filtroBusqueda='';
  mostrarModalForm=false; mostrarModalEliminar=false; model:Pago=this.nuevoPago(); pagoAEliminar:Pago|null=null;
  referenciaTransferencia='';
  detalles: DetalleVenta[]=[]; filtroTipo:'TODOS'|'MEMBRESIA'|'PRODUCTO'='TODOS';

  constructor(private service:PagoService,private inscripcionService:InscripcionService,private authService:AuthService,private detalleVentaService:DetalleVentaService){}
  ngOnInit():void{this.cargarDatos();}

  cargarDatos():void{
    this.service.listar().subscribe({next:r=>{this.pagos=[...r].sort((a,b)=>(b.idPago||0)-(a.idPago||0));this.filtrarPagos()},error:e=>console.error('Error cargando pagos:',e)});
    this.detalleVentaService.listar().subscribe({next:r=>this.detalles=r,error:e=>console.error('Error cargando detalles de venta:',e)});
    this.inscripcionService.listar().subscribe({next:r=>this.inscripciones=this.filtrarInscripciones(r),error:e=>console.error('Error cargando inscripciones:',e)});
  }
  esAdmin():boolean{return this.authService.obtenerRol()==='ADMIN';}
  private esClientePropio(i:Inscripcion):boolean{
    return true;
  }
  private filtrarInscripciones(items:Inscripcion[]):Inscripcion[]{return items;}
  cambiarFiltroTipo(t:'TODOS'|'MEMBRESIA'|'PRODUCTO'):void{this.filtroTipo=t;this.filtrarPagos();}
  contarPorTipo(t:'MEMBRESIA'|'PRODUCTO'):number{return this.pagos.filter(p=>this.obtenerTipoPago(p)===t).length;}
  filtrarPagos():void{
    const q=this.filtroBusqueda.toLowerCase().trim();
    this.pagosFiltrados=this.pagos.filter(p=>{
      if(this.filtroTipo!=='TODOS'&&this.obtenerTipoPago(p)!==this.filtroTipo)return false;
      return !q||`${this.obtenerTipoPago(p)} ${this.obtenerClientePago(p)} ${this.obtenerDetallePago(p)} ${p.metodoPago} ${p.estado}`.toLowerCase().includes(q);
    });
  }
  nuevoPago():Pago{return{tipoPago:'MEMBRESIA',monto:0,fechaPago:new Date().toISOString().substring(0,10),metodoPago:'Efectivo',estado:'Completado'};}
  abrirModalAdicion():void{this.model=this.nuevoPago();this.referenciaTransferencia='';this.mostrarModalForm=true;}
  cerrarModalForm():void{this.mostrarModalForm=false;}
  onInscripcionChange():void{const i=this.inscripciones.find(x=>x.idInscripcion===Number(this.model.inscripcion?.idInscripcion));if(i?.membresia)this.model.monto=i.membresia.precio;}
  onMetodoPagoChange():void{this.referenciaTransferencia='';}
  formularioValido():boolean{return !!this.model.inscripcion?.idInscripcion&&this.model.monto>0&&!!this.model.fechaPago&&!!this.model.metodoPago&&(this.model.metodoPago!=='Transferencia Bancaria'||!!this.referenciaTransferencia.trim());}
  guardarPago():void{
    if(!this.formularioValido())return;
    const ins=this.inscripciones.find(i=>i.idInscripcion===Number(this.model.inscripcion?.idInscripcion));if(!ins)return;
    this.model.tipoPago='MEMBRESIA';this.model.inscripcion=ins;this.model.venta=undefined;
    this.service.guardarMembresia({
      inscripcionId: ins.idInscripcion!,
      monto: this.model.monto,
      fechaPago: this.model.fechaPago,
      metodoPago: this.model.metodoPago,
      estado: this.model.estado
    }).subscribe({next:p=>{this.cargarDatos();this.cerrarModalForm();this.imprimirRecibo(p)},error:e=>console.error('Error guardando pago:',e)});
  }
  confirmarEliminar(p:Pago):void{this.pagoAEliminar=p;this.mostrarModalEliminar=true;}
  eliminarPago():void{if(this.pagoAEliminar?.idPago===undefined)return;this.service.eliminar(this.pagoAEliminar.idPago).subscribe({next:()=>{this.cargarDatos();this.mostrarModalEliminar=false;this.pagoAEliminar=null},error:e=>console.error('Error eliminando pago:',e)});}
  obtenerTipoPago(p:Pago):string{return p.tipoPago||'MEMBRESIA';}
  obtenerClientePago(p:Pago):string{return p.inscripcion?.cliente?`${p.inscripcion.cliente.nombre} ${p.inscripcion.cliente.apellido}`:p.venta?.cliente?`${p.venta.cliente.nombre} ${p.venta.cliente.apellido}`:'Cliente desconocido';}
  esProducto(p:Pago):boolean{return this.obtenerTipoPago(p)==='PRODUCTO';}
  detallesDeVenta(p:Pago):DetalleVenta[]{const id=p.venta?.idVenta;return id===undefined?[]:this.detalles.filter(d=>d.venta?.idVenta===id);}
  obtenerDetallePago(p:Pago):string{
    if(this.esProducto(p)){
      const items=this.detallesDeVenta(p);
      if(!items.length)return 'Venta de productos';
      return items.map(d=>`${d.producto?.nombre||'Producto'} ×${d.cantidad}`).join(', ');
    }
    return p.inscripcion?.membresia?.nombre||'Membresía';
  }
  obtenerReferenciaPago(p:Pago):string{return this.esProducto(p)?`Venta POS #${p.venta?.idVenta||'N/A'}`:`Ref. Inscripción #${p.inscripcion?.idInscripcion||'N/A'}`;}
  obtenerClaseEstado(estado:string):string{switch((estado||'').toLowerCase()){case'completado':return'badge-success';case'pendiente':return'badge-warning';case'reembolsado':return'badge-danger';default:return'badge-info';}}
  imprimirRecibo(p:Pago):void{
    const esProd=this.esProducto(p);
    const numero='R-'+String(p.idPago||0).padStart(6,'0');
    const filas=esProd
      ? this.detallesDeVenta(p).map(d=>`<tr><td>${this.escapar(d.producto?.nombre||'Producto')}</td><td class="c">${d.cantidad}</td><td class="r">$${Number(d.precioUnitario).toFixed(2)}</td><td class="r">$${Number(d.subtotal).toFixed(2)}</td></tr>`).join('')
      : `<tr><td>${this.escapar('Membresía: '+this.obtenerDetallePago(p))}</td><td class="c">1</td><td class="r">$${Number(p.monto).toFixed(2)}</td><td class="r">$${Number(p.monto).toFixed(2)}</td></tr>`;
    const css='body{font-family:Arial,Helvetica,sans-serif;padding:30px;color:#111827}.recibo{max-width:720px;margin:auto;border:1px solid #d1d5db;padding:30px;border-radius:12px}.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #6366f1;padding-bottom:14px;margin-bottom:18px}h1{margin:0;font-size:28px;letter-spacing:-1px}h1 span{color:#6366f1}.sub{color:#6b7280;font-size:13px;margin-top:4px}.num{text-align:right;font-size:13px;color:#374151}.num b{display:block;font-size:18px;color:#111827}.info{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;font-size:14px;margin-bottom:18px}table{width:100%;border-collapse:collapse;font-size:14px}th{background:#f3f4f6;text-align:left;padding:8px;border-bottom:1px solid #d1d5db}td{padding:8px;border-bottom:1px solid #e5e7eb}.c{text-align:center}.r{text-align:right}.total{font-size:24px;font-weight:800;text-align:right;margin-top:20px}.foot{margin-top:26px;text-align:center;color:#6b7280;font-size:12px}@media print{body{padding:0}.recibo{border:none}}';
    const html=`<html><head><meta charset="utf-8"><title>Recibo ${numero} - APEXFIT</title><style>${css}</style></head><body><div class="recibo"><div class="head"><div><h1>APEX<span>FIT</span></h1><div class="sub">Gimnasio · Recibo de ${esProd?'compra de productos':'membresía'}</div></div><div class="num">Recibo N°<b>${numero}</b></div></div><div class="info"><div><b>Cliente:</b> ${this.escapar(this.obtenerClientePago(p))}</div><div><b>Fecha:</b> ${this.escapar(p.fechaPago)}</div><div><b>Método de pago:</b> ${this.escapar(p.metodoPago)}</div><div><b>Estado:</b> ${this.escapar(p.estado)}</div><div><b>Referencia:</b> ${this.escapar(this.obtenerReferenciaPago(p))}</div></div><table><thead><tr><th>Descripción</th><th class="c">Cant.</th><th class="r">P. unitario</th><th class="r">Subtotal</th></tr></thead><tbody>${filas}</tbody></table><div class="total">Total: $${Number(p.monto).toFixed(2)}</div><div class="foot">¡Gracias por entrenar con APEXFIT!</div></div><script>window.onload=()=>window.print()</script></body></html>`;
    const w=window.open('','_blank','width=800,height=700');if(!w)return;w.document.open();w.document.write(html);w.document.close();
  }
  private escapar(v:string):string{return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
}
