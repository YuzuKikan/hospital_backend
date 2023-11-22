import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  displayedColumns: string[] = ['cedula', 'nombre', 'direccion', 'celular', 'correoElectronico', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);

  cantidadTotal = 0;
  cantidadPorPagina = 10;
  numeroDePagina = 0;
  opcionesDePaginado: number[] = [1, 5, 10, 25, 100];

  textoBusqueda = '';

  constructor(
    private HttpService: HttpService,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.LeerTodo();
  }

  LeerTodo() {
    this.HttpService.LeerTodoPaciente(this.cantidadPorPagina, this.numeroDePagina, this.textoBusqueda)
      .subscribe((respuesta: any) => {
        this.dataSource.data = respuesta.datos.elemento;
        this.cantidadTotal = respuesta.datos.cantidadTotal;
      })
  }

  cambiarPagina(event: any) {
    this.cantidadPorPagina = event.pageSize;
    this.numeroDePagina = event.pageIndex;

    this.LeerTodo();
  }

  eliminar(pacienteId: number) {
    let confirmacion = confirm('¿Estás seguro/a que desea eliminar el elemento?')
    if (confirmacion) {
      let ids = [pacienteId];

      this.HttpService.EliminarPaciente(ids)
        .subscribe((respuesta: any) => {
          this.toastr.success('Elemento eliminado satisfactoriamente.', 'Confirmación');
          this.LeerTodo();
        });

    }
  }

  crearPaciente() {
    const dialogRef = this.dialog.open(FormComponent, {
      disableClose: true,
      autoFocus: true,
      closeOnNavigation: false,
      position: { top: '30px' },
      width: '700px',
      data: {
        tipo: 'CREAR'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.LeerTodo();
    })
  }
  
  abrirVentana(row: any) {
    const dialogRef = this.dialog.open(FormComponent, {
      disableClose: true,
      autoFocus: true,
      closeOnNavigation: false,
      position: { top: '30px' },
      width: '700px',
      data: {
        tipo: 'MOSTRAR',
        datos: row,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.LeerTodo();
    })
  }
}
