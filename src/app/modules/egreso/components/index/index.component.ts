import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from '../form/form.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  displayedColumns: string[] = ['medicoId', 'ingresoId', 'fecha', 'tratamiento', 'monto', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  medicoNombres: { [key: number]: string } = {};
  ingresoData: { [key: number]: { datos: string, fecha: string } } = {};

  cantidadTotal = 0;
  cantidadPorPagina = 10;
  numeroDePagina = 0;
  opcionesDePaginado: number[] = [1, 5, 10, 25, 100];

  textoBusqueda = '';

  constructor(
    private HttpService: HttpService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.LeerTodo();
  }

  LeerTodo() {
    this.HttpService.LeerTodoEgreso(this.cantidadPorPagina, this.numeroDePagina, this.textoBusqueda)
      .subscribe((respuesta: any) => {
        console.log(respuesta);
        this.dataSource.data = respuesta.datos.elemento;
        this.cantidadTotal = respuesta.datos.cantidadTotal;

        this.medicoNombres = {}
        this.ingresoData = {}

        const observables = respuesta.datos.elemento.map((element: any) => {
          return forkJoin([
            this.getMedicoData(element.medicoId),
            this.getIngresoData(element.ingresoId)
          ]);
        });

        forkJoin(observables).subscribe(
          () => {
            // Todos los datos se han cargado, ahora puedes mostrar los datos en el componente.
            this.cdr.detectChanges();
          },
          (error: any) => {
            console.error('Error al obtener datos adicionales', error);
          }
        );
      })
  }

  cambiarPagina(event: any) {
    this.cantidadPorPagina = event.pageSize;
    this.numeroDePagina = event.pageIndex;
    this.LeerTodo();
  }

  eliminar(egresoId: number, event: Event) {
    event.stopPropagation();

    let confirmacion = confirm('¿Estás seguro/a que desea eliminar el elemento?')
    if (confirmacion) {
      let ids = [egresoId];

      this.HttpService.EliminarEgreso(ids)
        .subscribe((respuesta: any) => {
          this.toastr.success('Elemento eliminado satisfactoriamente.', 'Confirmación');
          this.LeerTodo();
        });
    }
  }

  crearEgreso() {
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

  getMedicoData(id: number) {
    this.HttpService.LeerUnoMedico(id).subscribe((respuesta: any) => {
      const medicoNombre = `[${respuesta.datos.cedula}] ${respuesta.datos.nombre} ${respuesta.datos.apellidoPaterno} ${respuesta.datos.apellidoMaterno != null ? respuesta.datos.apellidoMaterno : ""}`;

      this.medicoNombres[id] = medicoNombre;
      this.cdr.detectChanges();
    });
  }

  getIngresoData(id: number) {
    this.HttpService.LeerUnoIngreso(id).subscribe((respuesta: any) => {
      
      const ingresoDatos = {
        datos: `Diagnostico: ${respuesta.datos.diagnostico} // ${respuesta.datos.observacion != null ? 'Yes' : 'No'} // Fecha: `,
        fecha: respuesta.datos.fecha
      };

      // Verificar si la entrada ya existe antes de agregarla
      if (!this.ingresoData[id]) {
        this.ingresoData[id] = ingresoDatos;

        // Detección de cambios solo cuando se completa la adición de datos
        this.cdr.detectChanges();
      }
    });
  }




}
