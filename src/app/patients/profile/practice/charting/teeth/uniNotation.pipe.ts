import { PipeTransform, Pipe } from '@angular/core';

import {ConfigService} from '@common/services/config';

import * as uniNotationsObj from './uniNotation.json';

@Pipe({
    name: 'uniNotation'
})
export class UniNotationPipe implements PipeTransform {

    constructor(private _configService:ConfigService){}

    transform(value: any, args: string): any {
        
        let uniNotate = this._configService.account.is_uni_teeth_scheme;

        if (!uniNotate)
            return value;
        else
            if (value)
            if (value.toString().indexOf(',') != -1){
                let newValues = [];
                value.split(',').forEach((tooth) => {
                    newValues.push(uniNotationsObj[tooth]);
                })
                return newValues.join(',');
            }else
                return uniNotationsObj[value];
    }
}
