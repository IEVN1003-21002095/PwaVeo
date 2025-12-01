import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stars',
  standalone: true
})
export class StarsPipe implements PipeTransform {
  transform(value: number): string {
    const max = 5;
    const val = Math.max(0, Math.min(value, max)); // Asegura entre 0 y 5
    return '★'.repeat(val) + '☆'.repeat(max - val);
  }
}