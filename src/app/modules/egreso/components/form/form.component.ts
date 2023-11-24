import { Component, Inject, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidators } from '../../../../validators/cedula-format';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  formGroup!: FormGroup;
  ingresos: any[] = [];
  medicos: any[] = [];
  id!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    private httpService: HttpService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    forkJoin([
      this.httpService.LeerTodoMedico(10000, 0, ''),
      this.httpService.LeerTodoIngreso(10000, 0, '')
    ]).pipe(
      mergeMap(([medicosRespuesta, ingresosRespuesta]: any) => {
        this.medicos = medicosRespuesta.datos.elemento;
        this.ingresos = ingresosRespuesta.datos.elemento;
        return of(null); // Retorna un observable de valor nulo para continuar con la cadena.
      }),
      catchError(error => {
        // Manejar el error, por ejemplo, mostrar un mensaje de error.
        console.error('Error en la llamada de forkJoin:', error);
        return of(null); // Retorna un observable de valor nulo para continuar con la cadena.
      })
    ).subscribe(() => {
      // El código aquí se ejecutará después de que forkJoin y las operaciones adicionales hayan terminado.

    });
    if (this.data.tipo === 'CREAR') {
      this.initForm();
    }

    if (this.data.tipo === 'MOSTRAR') {
      this.initForm();
      this.getEgresoData(this.data.datos.id);
      this.formGroup.disable();
    }
  }


  cancelar() {
    this.dialogRef.close();
  }

  editar() {
    this.formGroup.enable();
    this.data.tipo = "EDITAR";
  }


  guardar() {
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;
      const fechaForm = new Date().toISOString().slice(0, 19);

      const dataOrden = {
        fecha: fechaForm,
        monto: dataForm.monto,
        medicoId: dataForm.medicoId,
        ingresoId: dataForm.ingresoId,
        tratamiento: dataForm.tratamiento
      }

      this.httpService.CrearEgreso(dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento guardado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close({ recargarDatos: true });
      },
        (error: any) => {
          this.toastr.error('No se pudo enviar el formulario.', 'Error');
        }
      );
    } else {
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }

  actualizar() {
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;
      const fechaForm = new Date().toISOString().slice(0, 19);

      const dataOrden = {
        fecha: fechaForm,
        monto: dataForm.monto,
        medicoId: dataForm.medicoId,
        ingresoId: dataForm.ingresoId,
        tratamiento: dataForm.tratamiento,
      };

      this.httpService.ActualizarEgreso(this.id, dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento actualizado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close({ recargarDatos: true });
      },
        (error: any) => {
          this.toastr.error('No se pudo enviar el formulario. "Actualizar" ', 'Error');
        }
      );
    } else {
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }


  initForm() {
    this.formGroup = this.fb.group({
      monto: [{ value: null, disabled: false }, [Validators.required, Validators.max(10000), NumberValidators.onlyNumbers]],
      medicoId: [{ value: null, disabled: false }, [Validators.required]],
      ingresoId: [{ value: null, disabled: false }, [Validators.required]],
      tratamiento: [{ value: null, disabled: false }, [Validators.required]]
    });
  }

  setFormValues(data: any) {
    this.formGroup = this.fb.group({
      monto: data.datos.monto,
      medicoId: data.datos.medicoId,
      ingresoId: data.datos.ingresoId,
      tratamiento: data.datos.tratamiento
    })
    this.id = data.datos.id;
  }

  getEgresoData(id: number) {
    this.httpService.LeerUnoEgreso(id).subscribe((respuesta: any) => {
      this.setFormValues(respuesta)
    })
  }


  actualizarPacienteIds() {
    this.ingresos.forEach((ingreso: any) => {
      this.httpService.LeerUnoPaciente(ingreso.pacienteId).subscribe((respuesta: any) => {
        // Actualizar el pacienteId con la información deseada
        const materno = respuesta.datos.apellidoMaterno != null ? respuesta.datos.apellidoMaterno : "";
        ingreso.pacienteId = `[${respuesta.datos.cedula}] ${respuesta.datos.nombre} ${respuesta.datos.apellidoPaterno} ${materno}`;
      });
    });
  }

  onMedicoSelected(event: any) {
    const selectedMedicoId = this.formGroup.get('medicoId')?.value;
    const selectedRowIndex = event?.target?.selectedIndex;
    if (selectedRowIndex !== undefined) {
      console.log(`Medico seleccionado: ${selectedMedicoId}, Fila: ${selectedRowIndex}, ALGO: ${event} === ${event?.target} === ${event?.target?.selectedIndex}`);
    }
    console.log(`Medico seleccionado: ${selectedMedicoId}, Fila: ${selectedRowIndex}, ALGO: ${event} === ${event?.target} === ${event?.target?.selectedIndex}`);
  }

  onIngresoSelected(event: any) {
    const selectedIngresoId = this.formGroup.get('ingresoId')?.value;
    const selectedRowIndex = event?.target?.selectedIndex;
    if (selectedRowIndex !== undefined) {
      console.log(`Ingreso seleccionado: ${selectedIngresoId}, Fila: ${selectedRowIndex}, ALGO: ${event} === ${event?.target} === ${event?.target?.selectedIndex}`);
    }
    console.log(`Ingreso seleccionado: ${selectedIngresoId}, Fila: ${selectedRowIndex}, ALGO: ${event} === ${event?.target} === ${event?.target?.selectedIndex}`);
  }


}
