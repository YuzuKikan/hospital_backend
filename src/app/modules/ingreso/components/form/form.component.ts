import { Component, Inject, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  formGroup!: FormGroup;
  pacientes: any[] = [];
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
    // console.log(this.data)

    this.httpService.LeerTodoPaciente(10000, 0, '').subscribe((respuesta: any) => {
      this.pacientes = respuesta.datos.elemento;
    });
    this.httpService.LeerTodoMedico(10000, 0, '').subscribe((respuesta: any) => {
      this.medicos = respuesta.datos.elemento;
    });

    if (this.data.tipo === 'CREAR') {
      this.initForm();
    }

    if (this.data.tipo === 'MOSTRAR') {
      this.initForm();
      this.getIngresoData(this.data.datos.id);
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
        numeroSala: dataForm.numeroSala,
        numeroCama: dataForm.numeroCama,
        diagnostico: dataForm.diagnostico,
        observacion: dataForm.observacion != "" ? dataForm.observacion : null,
        medicoId: dataForm.medicoId,
        pacienteId: dataForm.pacienteId
      }

      console.log("Data orden ==> ", dataOrden)
      this.httpService.CrearIngreso(dataOrden).subscribe((respuesta: any) => {
        // console.log("entra ==> " + respuesta);
        this.toastr.success('Elemento guardado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close(true);
      },
        (error: any) => {
          // console.error('Error al enviar el formulario:', error);
          this.toastr.error('No se pudo enviar el formulario.', 'Error');
        }
      );
    } else {
      // Formulario no válido, muestra un mensaje de error
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }

  actualizar() {
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;
      const fechaForm = new Date().toISOString().slice(0, 19);
      // console.log(fechaForm)

      const dataOrden = {
        fecha: fechaForm,
        numeroSala: dataForm.numeroSala,
        numeroCama: dataForm.numeroCama,
        diagnostico: dataForm.diagnostico,
        observacion: dataForm.observacion != "" ? dataForm.observacion : null,
        medicoId: dataForm.medicoId,
        pacienteId: dataForm.pacienteId
      };

      this.httpService.ActualizarIngreso(this.id, dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento actualizado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close(true);
      },
        (error: any) => {
          // console.error('Error al enviar el formulario:', error);
          this.toastr.error('No se pudo enviar el formulario. "Actualizar" ', 'Error');
        }
      );
    } else {
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }



  initForm() {
    this.formGroup = this.fb.group({
      medicoId: [{ value: null, disabled: false }, [Validators.required]],
      pacienteId: [{ value: null, disabled: false }, [Validators.required]],
      numeroSala: [{ value: null, disabled: false }, [Validators.required]],
      numeroCama: [{ value: null, disabled: false }, [Validators.required]],
      diagnostico: [{ value: null, disabled: false }, [Validators.required]],
      observacion: [{ value: null, disabled: false }]
    });
  }

  setFormValues(data: any) {
    this.formGroup.setValue({
      medicoId: data.datos.medicoId,
      pacienteId: data.datos.pacienteId,
      numeroSala: data.datos.numeroSala,
      numeroCama: data.datos.numeroCama,
      diagnostico: data.datos.diagnostico,
      observacion: data.datos.observacion
    })
    this.id = data.datos.id;
  }

  getIngresoData(id: number) {
    this.httpService.LeerUnoIngreso(id).subscribe((respuesta: any) => {
      this.setFormValues(respuesta)
    })
  }

}
