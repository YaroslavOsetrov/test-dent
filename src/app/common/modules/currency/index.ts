import {NgModule} from '@angular/core';
import {PipeTransform, Injectable, Pipe} from '@angular/core';

@Pipe({
    name: 'myCurrency'
})
@Injectable()
export class MyCurrencyPipe implements PipeTransform {


    transform(value: string, currencyCode:string, onlyCode?:boolean): any {

        let prefix = '';
        let postfix = '';


        if (!value)
            value = '0';

        let formattedDefault = Number(value).toFixed(2).replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });

   //     let formattedDefault = new CurrencyPipe().transform(value);

        let formattedValue = '';
        if (formattedDefault)
            formattedValue = formattedDefault.toString().replace('USD', '');

        if (currencyCode){
            currencyCode = currencyCode.toLowerCase();
            switch(currencyCode){
                case 'rub':postfix = ' руб.'; break;
                case 'uah':postfix = ' грн.'; break;
                case 'aud':prefix = '$'; break;
                case 'sgd':prefix = '$'; break;
                case 'lbp':postfix = ' LBP'; break;
                case 'mdl':postfix = ' lei'; break;
                case 'azn':postfix = ' AZN'; break;
                case 'hkd':prefix = '$'; break;
                case 'bdt':prefix = 'Tk'; break;
                case 'byr':postfix = ' руб.'
                case 'inr':prefix = '₹'; break;
                case 'brl':prefix = 'R$'; break;
                case 'clp':prefix = '$'; break;
                case 'myr':postfix = ' rm'; break;
                case 'thb':prefix = '฿'; break;
                case 'php':prefix = '₱'; break;
                case 'usd':prefix = '$'; break;
                case 'nzd':prefix = '$'; break;
                case 'hrk':prefix = 'HRK'; break;
                case 'rsd':postfix = ' RSD'; break;
                case 'huf':postfix = ' Ft'; break;
                case 'czk':postfix = ' Kč'; break;
                case 'eur':prefix = '€'; break;
            }

            if (onlyCode == true)
                return prefix + postfix;

            return prefix + formattedValue + postfix;
        }else{
            if (onlyCode == true)
                return prefix + postfix;

            return value;
        }

    }
}

@NgModule({
    // directives, components, and pipes
    declarations: [
        MyCurrencyPipe
    ],
    exports:[
        MyCurrencyPipe
    ]
})
export class MyCurrencyModule { }
