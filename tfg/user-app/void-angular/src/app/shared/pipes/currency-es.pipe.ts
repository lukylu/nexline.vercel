import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyEs', standalone: true })
export class CurrencyEsPipe implements PipeTransform {
  transform(value: number): string {
    return value.toFixed(2).replace('.', ',') + ' €';
  }
}
