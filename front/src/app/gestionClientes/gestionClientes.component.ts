import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GestionClientesService } from './gestionClientes.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-gestion-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './gestionClientes.component.html',
})
export class GestionClientesComponent implements OnInit {
  
  clientes: any[] = [];
  totalClientes: number = 0;
  totalPaginas: number = 0;
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  searchTerm: string = '';
  private searchSubject: Subject<string> = new Subject();

  mostrarModal: boolean = false;
  clienteSeleccionado: any = null;
  pedidos: any[] = [];

  constructor(
    private clientesService: GestionClientesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((textoBusqueda: string) => {
      this.searchTerm = textoBusqueda;
      this.paginaActual = 1; 
      this.cargarClientes();
    });
  }

  cargarClientes() {
    this.clientesService.getClientes(this.paginaActual, this.itemsPorPagina, this.searchTerm)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.clientes = response.clientes;
            this.totalClientes = response.total_clients;
            this.totalPaginas = response.total_pages;
          }
        },
        error: (err: any) => {
          if (err.status === 401) {
            alert('Tu sesión ha expirado');
            this.router.navigate(['/auth/login']);
          }
        }
      });
  }

  onSearch(termino: string) {
    this.searchSubject.next(termino);
  }

  prevPage() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarClientes();
    }
  }

  nextPage() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarClientes();
    }
  }

  eliminarCliente(id: number) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este cliente?');
    if (confirmar) {
      this.clientesService.deleteCliente(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Cliente eliminado');
            this.cargarClientes();
          } else {
            alert('Error al eliminar: ' + response.message);
          }
        },
        error: () => {
          alert('Error de servidor al eliminar');
        }
      });
    }
  }

  abrirModalEditar(cliente: any) {
    this.clientesService.getClienteById(cliente.id).subscribe({
        next: (res: any) => {
            if (res.success) {
                this.clienteSeleccionado = res.cliente;
                if (!this.clienteSeleccionado.direccion) this.clienteSeleccionado.direccion = '';
                if (!this.clienteSeleccionado.telefono) this.clienteSeleccionado.telefono = '';
                this.mostrarModal = true;
                this.cargarPedidos(cliente.id);
            } else {
                alert('No se pudieron cargar los detalles del cliente');
            }
        },
        error: () => alert('Error al obtener detalles del cliente')
    });
  }

  cargarPedidos(id: number) {
    this.pedidos = [];
    this.clientesService.getPedidosCliente(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pedidos = res.pedidos;
        }
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.clienteSeleccionado = null;
    this.pedidos = [];
  }

  guardarCambiosCliente() {
    if (!this.clienteSeleccionado) return;
    this.clientesService.updateCliente(this.clienteSeleccionado.id, this.clienteSeleccionado).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Datos actualizados correctamente');
          this.cerrarModal();
          this.cargarClientes();
        } else {
          alert('Error: ' + res.message);
        }
      },
      error: () => {
        alert('Error al guardar cambios');
      }
    });
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Clientes', 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 28);
    const head = [['ID', 'Nombre Completo', 'Correo Electrónico', 'Fecha Registro']];
    const data = this.clientes.map(c => [
      c.id, c.nombre_completo, c.correo, c.fecha_registro
    ]);
    autoTable(doc, { head: head, body: data, startY: 35, theme: 'grid' });
    doc.save('clientes_reporte.pdf');
  }

  exportarCSV() {
    const headers = ['ID,Nombre Completo,Correo Electrónico,Fecha Registro'];
    const rows = this.clientes.map(c => 
      `${c.id},"${c.nombre_completo}",${c.correo},${c.fecha_registro}`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'clientes_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}