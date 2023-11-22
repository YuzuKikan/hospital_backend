import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class NumberCelulaValidators {

  static cedulaFormat(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || isNaN(value)) {
      return { cedulaFormat: true };
    }

    const numberString = value.toString();
    if (numberString.length !== 10) {
      return { cedulaFormat: true };
    }

    return null;
  }

}

export class CustomValidators {

  static noNumbersOrSpaces(control: AbstractControl): ValidationErrors | null {
    const regex = /^[^\d\s]+$/; // Expresión regular que acepta solo caracteres no numéricos ni espacios
    const valid = regex.test(control.value);
    return valid ? null : { noNumbersOrSpaces: true };
  }

}