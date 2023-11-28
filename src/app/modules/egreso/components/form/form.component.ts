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
  ingresosOriginales: any[] = [];
  medicosOriginales: any[] = [];
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
        // Guarda copias originales
        this.medicosOriginales = [{ id: null, nombre: '--Seleccione--' }, ...this.medicos];
        this.ingresosOriginales = [{ id: null, nombre: '--Seleccione--' }, ...this.ingresos];
        // Filtrar ingresos y médicos eliminados
        //################################### CUESTIONABLE
        this.ingresos = this.ingresos.filter(ingreso => this.medicoExists(ingreso.medicoId));
        this.medicos = this.medicos.filter(medico => this.medicoExists(medico.id));

        return of(null); // Retorna un observable de valor nulo para continuar con la cadena.
      }),
      catchError(error => {
        // Manejar el error, por ejemplo, mostrar un mensaje de error.
        console.error('Error en la llamada de forkJoin:', error);
        return of(null);
      })
    ).subscribe(() => {
      this.medicos.unshift({ id: null, select: '--Seleccione--' });
      this.ingresos.unshift({ id: null, select: '--Seleccione--' });
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

  //################################### CUESTIONABLE
  medicoExists(medicoId: number): boolean {
    return this.medicos.some(medico => medico.id === medicoId);
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

    // Filtrar los ingresos según el medicoId seleccionado
    if (selectedMedicoId !== null) {
      this.ingresos = this.ingresos.filter(ingreso => ingreso.medicoId === selectedMedicoId);
    } else {
      this.ingresos = [...this.ingresosOriginales]; 
    }
    this.medicos = [...this.medicosOriginales];
  }

  onIngresoSelected(event: any) {
    const selectedIngresoId = this.formGroup.get('ingresoId')?.value;
    // console.log(`Ingreso seleccionado: ${selectedIngresoId}, ALGO: ${event} `);
    // Filtrar los médicos según el ingresoId seleccionado
    if (selectedIngresoId !== null) {
      const medicoId = this.ingresos.find(ingreso => ingreso.id === selectedIngresoId)?.medicoId;
      this.medicos = this.medicos.filter(medico => medico.id === medicoId);
    } else {
      this.medicos = [...this.medicosOriginales]; // Si no hay selección, mantener todos los médicos
    }
    // Restablecer Biblioteca Ingresos a la copia original de ingresos
    this.ingresos = [...this.ingresosOriginales];
  }



}
