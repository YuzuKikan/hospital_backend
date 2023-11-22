import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class NumberValidators {

  static cedulaFormat(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || isNaN(value)) {
      return { cedulaFormat: 'La cédula debe ser solo numérico.' };
    }

    const numberString = value.toString();
    if (numberString.length !== 10) {
      return { cedulaFormat: 'La cédula debe contener 10 números.' };
    }

    return null; 
  }

  static celularFormat(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || isNaN(value)) {
      return { celularFormat: 'El número de celular debe ser solo numérico.' };
    }

    const numberString = value.toString();
    if (numberString.length !== 9) {
      return { celularFormat: 'El número de celular debe contener 9 números.' };
    }

    return null;
  }
}

export class CustomValidators {

  static noNumbersOrSpaces(control: AbstractControl): ValidationErrors | null {
    const regex = /^[^\d\s]+$/; // Expresión regular que acepta solo caracteres no numéricos ni espacios
    const valid = regex.test(control.value);
    return valid ? null : { noNumbersOrSpaces: 'No se admiten números ni espacios en blanco.' };
  }

}
