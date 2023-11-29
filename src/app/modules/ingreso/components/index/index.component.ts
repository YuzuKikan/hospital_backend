import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from '../form/form.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  displayedColumns: string[] = ['medicoId', 'pacienteId', 'fecha', 'numeroSala', 'numeroCama', 'diagnostico', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  pacienteNombres: { [key: number]: string } = {};
  medicoNombres: { [key: number]: string } = {};

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
    this.HttpService.LeerTodoIngreso(this.cantidadPorPagina, this.numeroDePagina, this.textoBusqueda)
      .pipe(
        map((respuesta: any) => {
          this.dataSource.data = respuesta.datos.elemento;
          this.cantidadTotal = respuesta.datos.cantidadTotal;
          console.log("Devuelve respeusta ", respuesta.datos.elemento)
          return respuesta.datos.elemento;
        }),
        mergeMap((elementos: any[]) => {
          const observables = elementos.map((element: any) =>
            forkJoin([
              this.getPacienteData(element.pacienteId),
              this.getMedicoData(element.medicoId)
            ]).pipe(
              map(() => element), // Retornar elemento solo si se obtienen paciente y médico exitosamente
              catchError(() => of(null)) // Manejar el error y devolver un observable nulo
            ));
          console.log("Lista medicos => ", this.medicoNombres)
          console.log("Lista pacientes => ", this.pacienteNombres)
          console.log("Lista 1 => ",this.dataSource.data);
          console.log("Lista 2 => ",this.cantidadTotal);
          return forkJoin(observables);
        }),
        catchError((error: any) => {
          console.error('Error al obtener datos principales', error);
          return of(null);
        })
      )
      .subscribe(
        (respuesta: any) => {
          // Filtrar los elementos que tienen coincidencia en médico y paciente
          const dataSourceFiltrado = this.dataSource.data.filter((element: any) => {
            return this.medicoNombres.hasOwnProperty(element.medicoId) && this.pacienteNombres.hasOwnProperty(element.pacienteId);
          });
          console.log(this.dataSource.data)
          console.log(dataSourceFiltrado)
          this.dataSource.data = dataSourceFiltrado;
          console.log(this.cantidadTotal)
          console.log(dataSourceFiltrado.length)
          this.cantidadTotal = this.cantidadTotal - dataSourceFiltrado.length;

          // Todos los datos se han cargado y filtrado, ahora puedes mostrar los datos en el componente.
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error al obtener datos adicionales', error);
        }
      );
  }



  cambiarPagina(event: any) {
    this.cantidadPorPagina = event.pageSize;
    this.numeroDePagina = event.pageIndex;
    this.LeerTodo();
  }

  eliminar(ingresoId: number, event: Event) {
    event.stopPropagation();

    let confirmacion = confirm('¿Estás seguro/a que desea eliminar el elemento?')
    if (confirmacion) {
      let ids = [ingresoId];

      this.HttpService.EliminarIngreso(ids)
        .subscribe((respuesta: any) => {
          this.toastr.success('Elemento eliminado satisfactoriamente.', 'Confirmación');
          this.LeerTodo();
        });
    }
  }

  crearIngreso() {
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
      if (result && result.recargarDatos) {
        this.LeerTodo();
      }
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
      if (result && result.recargarDatos) {
        this.LeerTodo();
      }
    })
  }

  getPacienteData(id: number) {
    return this.HttpService.LeerUnoPaciente(id).pipe(
      map((respuesta: any) => {
        const pacienteNombre = `[${respuesta.datos.cedula}] ${respuesta.datos.nombre} ${respuesta.datos.apellidoPaterno} ${respuesta.datos.apellidoMaterno != null ? respuesta.datos.apellidoMaterno : ""}`;
        this.pacienteNombres[id] = pacienteNombre;
      }),
      catchError((error) => this.handleError('paciente', error))
    );
  }

  getMedicoData(id: number) {
    return this.HttpService.LeerUnoMedico(id).pipe(
      map((respuesta: any) => {
        const medicoNombre = `[${respuesta.datos.cedula}] ${respuesta.datos.nombre} ${respuesta.datos.apellidoPaterno} ${respuesta.datos.apellidoMaterno != null ? respuesta.datos.apellidoMaterno : ""}`;
        this.medicoNombres[id] = medicoNombre;
      }),
      catchError((error) => this.handleError('medico', error))
    );
  }

  handleError(tipo: string, error: any) {
    console.error(`Error al obtener datos del ${tipo}`, error);
    return of(null);
  }

  // cargarBibliotecaMedico() {
  //   // Llamada al servicio para obtener la lista de médicos
  //   this.HttpService.LeerTodoMedico(100, this.numeroDePagina, this.textoBusqueda)
  //     .subscribe((respuesta: any) => {
  //       // Asumo que datos es un array de médicos en la respuesta
  //       const datosMedicos = respuesta.datos.elemento;
  //       // Llenar la biblioteca de médicos con la información necesaria
  //       this.bibliotecaMedicosMatriz = datosMedicos.map((medico: any) => ({
  //         id: medico.id,
  //         cedula: medico.cedula,
  //         nombre: medico.nombre,
  //       }));
  //     });   
  // console.log("LeerTodo ==> ", this.bibliotecaMedicosMatriz);
  // }
}
