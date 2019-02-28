import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'procedureSearch'
})
export class ProcedureSearchPipe implements PipeTransform {
    transform(value: any, args: string): any {
        let filter = args.toLocaleLowerCase();

        return filter ? (value.filter(row=> row.name.toLocaleLowerCase().indexOf(filter) != -1 || row.code.toLocaleLowerCase().indexOf(filter) != -1)) : value;
    }
}
