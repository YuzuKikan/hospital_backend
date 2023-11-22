import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
  keyMedicos: { [key: number]: string } = {};
  id!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FormComponent>,
    private fb: FormBuilder,
    private httpService: HttpService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // console.log(this.data);

    this.keyMedicos = {};
    this.setKeyMedicos();

    console.log(this.keyMedicos);

    if (this.data.tipo === 'CREAR') {
      this.initForm();
    }

    if (this.data.tipo === 'MOSTRAR') {
      this.initForm();
      this.getMedicoData(this.data.datos.id);
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

      const cedulaExistente = Object.values(this.keyMedicos).includes(dataForm.cedula);
      if (cedulaExistente) {
        this.toastr.error('Ya existe un médico con la misma cédula.', 'Error');
        return;
      }

      const dataOrden = {
        cedula: dataForm.cedula,
        nombre: dataForm.nombre,
        habilitado: dataForm.habilitado,
        esEspecialista: dataForm.esEspecialista,
        apellidoPaterno: dataForm.apellidoPaterno,
        apellidoMaterno: dataForm.apellidoMaterno
      };

      this.httpService.CrearMedico(dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento guardado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close(true);
      },
        (error: any) => {
          // console.error('Error al enviar el formulario:', error);
          this.toastr.error('No se pudo enviar el formulario.', 'Error');
        });
    } else {
      // Formulario no válido, muestra un mensaje de error
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }

  actualizar() {
    if (this.formGroup.valid) {
      const dataForm = this.formGroup.value;
      const cedulaExistente = Object.values(this.keyMedicos).includes(dataForm.cedula);

      if (cedulaExistente) {
        this.toastr.error('Ya existe un médico con la misma cédula.', 'Error');
        return;
      }
      
      const dataOrden = {
        cedula: dataForm.cedula,
        nombre: dataForm.nombre,
        habilitado: dataForm.habilitado,
        esEspecialista: dataForm.esEspecialista,
        apellidoPaterno: dataForm.apellidoPaterno,
        apellidoMaterno: dataForm.apellidoMaterno != "" ? dataForm.apellidoMaterno : null
      };

      this.httpService.ActualizarMedico(this.id, dataOrden).subscribe((respuesta: any) => {
        this.toastr.success('Elemento actualizado satisfactoriamente.', 'Confirmación');
        this.dialogRef.close(true);
      },
        (error: any) => {
          // console.error('Error al enviar el formulario:', error);
          this.toastr.error('No se pudo enviar el formulario. "Actualizar" ', 'Error');
        }
      );
    } else {
      const cedulaError = NumberValidators.cedulaFormat(this.formGroup.get('cedula')!);
      if (cedulaError) {
        console.log("error cedula letra o numero");
        this.toastr.error(cedulaError['cedulaFormat'], 'Error en la cédula');
        return;
      }
      const nombreError = CustomValidators.noNumbersOrSpaces(this.formGroup.get('nombre')!);
      if (nombreError) {
        console.log("error nombre o apellido");
        this.toastr.error(nombreError['noNumbersOrSpaces'], 'Error en la nombre o apellido');
        return;
      }
      this.toastr.error('Por favor, completa todos los campos obligatorios.', 'Error');
    }
  }



  initForm() {
    this.formGroup = this.fb.group({
      cedula: [{ value: null, disabled: false }, [Validators.required, NumberValidators.cedulaFormat]],
      nombre: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      habilitado: [{ value: true, disabled: false }, [Validators.required]],
      esEspecialista: [{ value: true, disabled: false }, [Validators.required]],
      apellidoPaterno: [{ value: null, disabled: false }, [Validators.required, CustomValidators.noNumbersOrSpaces]],
      apellidoMaterno: [{ value: null, disabled: false }]
    });
  }

  setFormValues(data: any) {
    this.formGroup.setValue({
      cedula: data.datos.cedula,
      nombre: data.datos.nombre,
      apellidoPaterno: data.datos.apellidoPaterno,
      apellidoMaterno: data.datos.apellidoMaterno,
      esEspecialista: data.datos.esEspecialista,
      habilitado: data.datos.habilitado
    });

    this.id = data.datos.id;
  }

  getMedicoData(id: number) {
    this.httpService.LeerUnoMedico(id).subscribe((respuesta: any) => {
      this.setFormValues(respuesta);
    });
  }

  setKeyMedicos() {
    this.httpService.LeerTodoMedico(10000, 0, '').subscribe((respuesta: any) => {
      // Obtener la lista de médicos
      const medicos = respuesta.datos.elemento;

      const observables = medicos.map((medico: any) => {
        return this.httpService.LeerUnoMedico(medico.id);
      });
      forkJoin(observables).subscribe((resultados: any) => {
        resultados.forEach((medicKey: any, index: number) => {
          const cedula = `${medicKey.datos.cedula}`;
          this.keyMedicos[medicos[index].id] = cedula;
        });
        this.cdr.detectChanges();
      });
    });
  }
}
