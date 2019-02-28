import {NgModule, PipeTransform, Injectable, Pipe} from '@angular/core';


import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import * as moment from 'moment';

import {TranslateService} from '@ngx-translate/core';

import {ConfigService} from './../services/config';

import * as currencies from './../json/currencies.json';
import * as dateLocale from './../../../../public/i18n/date.json';

@Pipe({
    name: 'datex'
})
@Injectable()
export class DatexPipe implements PipeTransform {

    lang:string;

    localeFormat:any;

    constructor(private translateService:TranslateService, private configService:ConfigService){

        this.lang = this.translateService.currentLang;

        this.localeFormat = this.configService.country.locale_format;
    }



    transform(value: string, format: string = "",  addDiffYear:boolean = false): string {
        if (!value || value==="") return "";

        let year = '';

        if (addDiffYear == true && moment(value).format('YYYY') != new Date().getFullYear().toString()){
            year = ', ' + moment(value).format('YYYY');
        }

        let valueFormatted = '';
    
        let timeFormat = (this.localeFormat.is_24h) ? 'HH:mm' : 'h:mma';

        for (let key in dateLocale){
			moment.defineLocale(key, {
				months  : dateLocale[key]['months_names'],
				monthsShort : dateLocale[key]['months_names_short'],
				weekdays : dateLocale[key]['day_names'],
				weekdaysShort : dateLocale[key]['day_names_short'],
				weekdaysMin  : dateLocale[key]['day_names_min'],
				week:{
					dow:(this.configService.scheduler)?this.configService.scheduler.first_day_index:1,
					doy:new Date(new Date().getFullYear(), 0, 1).getDay()
				}
			});
		}

		moment.locale(this.translateService.currentLang);
        
        switch(format){
            case 'short2': valueFormatted = this.localeFormat.date_short2; break;
            case 'short': valueFormatted = this.localeFormat.date_short; break;
            case 'full': valueFormatted = this.localeFormat.date_full; break;
            case 'full2': valueFormatted = this.localeFormat.date_full2; break;
            case 'time': valueFormatted = this.localeFormat.time_mom; break;
            default : valueFormatted = format;
        }
        
        if (format == 'time'){
            return moment(value, ["YYYY-MM-DDTHH:mm"]).locale(this.lang).add(this.configService.account.timezone_offset * -1, 'minutes').format(valueFormatted);
        }else
            return moment(value, ["YYYY-MM-DDTHH:mm"]).locale(this.lang).format(valueFormatted) +  year;
    }
}

@Pipe({
    name: 'nameLetters'
})
@Injectable()
export class NameLettersPipe implements PipeTransform {


    transform(value: string): any {
        
        if (value){
            if (value.length > 1){
                 let splitted = value.split(' ');

                 let formatted = splitted[0].charAt(0);

                 if (splitted.length > 1){
                     formatted = formatted + splitted[1].charAt(0);
                 }else{
                     if (splitted[0].length > 1)
                        formatted += splitted[0].charAt(1);
                 }
                 return formatted;
            }else{
                return value[0];
            }
            
        }else{
            return '';
        }

    }
}

@Pipe({
    name: 'myCurrency'
})
@Injectable()
export class MyCurrencyPipe implements PipeTransform {

    constructor(private configService:ConfigService){}

    transform(value: string, currencyCode?:string, onlyCode?:boolean): any {

        let prefix = '';
        let postfix = '';

        if (!currencyCode || currencyCode.length == 0){

            currencyCode = this.configService.defaults.currency_code;

        }

        if (!value)
            value = '0';

        let formattedDefault = Number(value).toFixed(2).replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });

        let formattedValue = '';
        if (formattedDefault)
            formattedValue = formattedDefault.toString().replace('USD', '');

        if (currencyCode){
            currencyCode = currencyCode.toLowerCase();

            let currency = currencies[currencyCode];

            if (currency == null){
                return formattedValue;
            }

            if (currency['is_currency_prefix'] == true){
                prefix =  currency['currency_symbol'];
            }else{
                postfix =  currency['currency_symbol'];
            }

            if (currencyCode == 'vnd'){
                formattedValue = formattedValue.toString().split('.')[0];
            }

            if (formattedValue.toString().indexOf('-,') !== -1){
                formattedValue = '-' + formattedValue.toString().split('-,')[1];
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


@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    let keys = [];
    for (let key in value) {
      keys.push(key);
    }
    return keys;
  }
}

@Directive({
  selector: '[onlyNumber]'
})
export class OnlyNumber {

  constructor(private el: ElementRef) { }

  @Input() OnlyNumber: boolean;

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent> event;
    if (this.OnlyNumber) {
      if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
        // Allow: Ctrl+V
        (e.keyCode == 86 && e.ctrlKey === true) ||
        // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
          // let it happen, don't do anything
          return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
      }
  }
}

@NgModule({
    declarations: [
        DatexPipe,
        MyCurrencyPipe,
        KeysPipe,
        NameLettersPipe,
        OnlyNumber
    ],
    exports:[
        DatexPipe,
        MyCurrencyPipe,
        KeysPipe,
        NameLettersPipe,
        OnlyNumber
    ]
})
export class CommonPipesModule { }
