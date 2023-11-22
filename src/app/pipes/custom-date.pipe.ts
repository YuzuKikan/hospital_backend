import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  transform(value: string): string {
    const fecha = new Date(value);
    const fechaFormat = fecha.toLocaleDateString('es-ES',
      {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

    return fechaFormat.replace(",", "");
  }
}