import { Component, Inject, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../../validators/validadores-prueba';
import { NumberValidators } from '../../../../validators/cedula-format';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  formGroup!: FormGroup;
  id!: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    private httpService: HttpService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // console.log(this.data);

    if (this.data.tipo === 'CREAR') {
      this.initForm();
    }

    if (this.data.tipo === 'MOSTRAR') {
      this.initForm();
      this.getPacienteData(this.data.datos.id);
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
    // console.log("GUARDAR, tipo de data: ", this.data);
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;

      const dataOrden = {
        cedula: dataForm.cedula,
        nombre: dataForm.nombre,
        celular: dataForm.celular,
        direccion: dataForm.direccion,
        apellidoPaterno: dataForm.apellidoPaterno,
        apellidoMaterno: dataForm.apellidoMaterno != "" ? dataForm.apellidoMaterno : null,
        correoElectronico: dataForm.correoElectronico
      };

      this.httpService.CrearPaciente(dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento guardado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close(true);
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

      const dataOrden = {
        cedula: dataForm.cedula,
        nombre: dataForm.nombre,
        celular: dataForm.celular,
        direccion: dataForm.direccion,
        apellidoPaterno: dataForm.apellidoPaterno,
        apellidoMaterno: dataForm.apellidoMaterno != "" ? dataForm.apellidoMaterno : null,
        correoElectronico: dataForm.correoElectronico
      }
      console.log("Data orden ==> ", dataOrden)

      this.httpService.ActualizarPaciente(this.id, dataOrden).subscribe((respuesta: any) => {
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
      cedula: [{ value: null, disabled: false }, [Validators.required, NumberValidators.cedulaFormat]],
      nombre: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      apellidoPaterno: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      apellidoMaterno: [{ value: null, disabled: false }],
      celular: [{ value: null, disabled: false }, [Validators.required, NumberValidators.celularFormat]],
      direccion: [{ value: null, disabled: false }, [Validators.required]],
      correoElectronico: [{ value: null, disabled: false }, [Validators.required, Validators.email]]
    });
  }

  setFormValues(data: any) {
    this.formGroup.setValue({
      cedula: data.datos.cedula,
      nombre: data.datos.nombre,
      apellidoPaterno: data.datos.apellidoPaterno,
      apellidoMaterno: data.datos.apellidoMaterno,
      direccion: data.datos.direccion,
      celular: data.datos.celular,
      correoElectronico: data.datos.correoElectronico
    });

    this.id = data.datos.id;
  }

  getPacienteData(id: number) {
    this.httpService.LeerUnoPaciente(id).subscribe((respuesta: any) => {
      this.setFormValues(respuesta);
    });
  }
}
