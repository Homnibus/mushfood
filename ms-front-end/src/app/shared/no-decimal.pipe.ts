import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'noDecimal'})
export class NoDecimalPipe implements PipeTransform {

  transform(value: number): number {
    if (value % 1 > 0) {
      return value;
    } else {
      return Math.floor(value);
    }
  }

}
