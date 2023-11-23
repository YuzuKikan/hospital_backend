import { ChangeDetectorRef, Component, HostListener, Inject, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from '../../../../validators/cedula-format';
import { NumberValidators } from '../../../../validators/cedula-format';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  formGroup!: FormGroup;
  dialogTitle!: string;
  keyPacientes: { [key: number]: string } = {};
  id!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    private httpService: HttpService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    this.cancelar();
  }

  ngOnInit(): void {
    // console.log(this.data);
    this.keyPacientes = {};
    this.setKeyPacientes();

    if (this.data.tipo === 'CREAR') {
      this.dialogTitle = 'Crear Datos Paciente';
      this.initForm();
    }

    if (this.data.tipo === 'MOSTRAR') {
      this.dialogTitle = 'Actualizar Datos Paciente';
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
      const cedulaExistente = Object.values(this.keyPacientes).includes(dataForm.cedula);

      if (cedulaExistente) {
        this.toastr.error('Ya existe un médico con la misma cédula.', 'Error');
        return;
      }

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
        this.dialogRef.close({ recargarDatos: true });
      },
        (error: any) => {
          this.toastr.error('No se pudo enviar el formulario.', 'Error');
        }
      );
    } else {
      this.mensajeError();
    }
  }

  actualizar() {
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;

      if (this.existePaciente(this.id, dataForm.cedula)) {
        this.toastr.error('Ya existe otro médico con la misma cédula.', 'Error');
        return;
      }

      const dataOrden = {
        cedula: dataForm.cedula,
        nombre: dataForm.nombre,
        celular: dataForm.celular,
        direccion: dataForm.direccion,
        apellidoPaterno: dataForm.apellidoPaterno,
        apellidoMaterno: dataForm.apellidoMaterno != "" ? dataForm.apellidoMaterno : null,
        correoElectronico: dataForm.correoElectronico
      }

      this.httpService.ActualizarPaciente(this.id, dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento actualizado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close({ recargarDatos: true });
      },
        (error: any) => {
          this.toastr.error('No se pudo enviar el formulario. "Actualizar" ', 'Error');
        }
      );
    } else {
      this.mensajeError();
    }
  }



  initForm() {
    this.formGroup = this.fb.group({
      cedula: [{ value: null, disabled: false }, [Validators.required, NumberValidators.onlyNumbers, NumberValidators.cedulaFormat]],
      nombre: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      apellidoPaterno: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      apellidoMaterno: [{ value: null, disabled: false }],
      celular: [{ value: null, disabled: false }, [Validators.required, NumberValidators.onlyNumbers, NumberValidators.celularFormat]],
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

  setKeyPacientes() {
    this.httpService.LeerTodoPaciente(10000, 0, '').subscribe((respuesta: any) => {
      // Obtener la lista de médicos
      const pacientes = respuesta.datos.elemento;

      const observables = pacientes.map((paciente: any) => {
        return this.httpService.LeerUnoPaciente(paciente.id);
      });
      forkJoin(observables).subscribe((resultados: any) => {
        resultados.forEach((medicKey: any, index: number) => {
          const cedula = `${medicKey.datos.cedula}`;
          this.keyPacientes[pacientes[index].id] = cedula;
        });
        this.cdr.detectChanges();
      });
    });
  }

  existePaciente(id: number, cedula: string): boolean {
    const otrasCedulas = Object.entries(this.keyPacientes)
      .filter(([key, value]) => Number(key) !== id && value === cedula);

    return otrasCedulas.length > 0;
  }

  mensajeError() {
    const cedulaError = NumberValidators.cedulaFormat(this.formGroup.get('cedula')!);
    if (cedulaError) {
      this.toastr.error(cedulaError['cedulaFormat'], 'Error en la cédula');
      return;
    }
    var nombreError = CustomValidators.noNumbersOrSpaces(this.formGroup.get('nombre')!);
    if (nombreError) {
      this.toastr.error(nombreError['noNumbersOrSpaces'], 'Error en la nombre o apellido');
      return;
    }
    nombreError = CustomValidators.noNumbersOrSpaces(this.formGroup.get('apellidoPaterno')!);
    if (nombreError) {
      this.toastr.error(nombreError['noNumbersOrSpaces'], 'Error en la nombre o apellido');
      return;
    }
    // Formulario no válido, muestra un mensaje de error
    this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
  }
}
