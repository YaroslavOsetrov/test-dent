import { Directive, Output, EventEmitter, Component, NgModule, HostListener, Input, ElementRef } from '@angular/core';
import { 
  NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl 
} from '@angular/forms';

import * as phoneCodes from './../../../../../public/json/phone_codes.json';

import {ConfigService} from './../../services/config';

import * as countries from './../../../../../public/json/countries.json';

@Directive({
    selector: '[phoneLookup]'
})
export class PhoneMaskDirective {


    @Output('countrySetted') countrySetted:EventEmitter<any> = new EventEmitter<any>();
    isRequired:boolean = false;

    constructor(public formControl: NgControl, private el:ElementRef, private configService:ConfigService){
        if (this.el.nativeElement.hasAttribute('required')){
            this.isRequired = true;
        }
    }
    
    masks:Array<string> = phoneCodes['items'];

    countries:any = countries;

    currentMask:string;

    isCompleted:boolean = false;

    countryCode:string;


    @HostListener('input', ['$event'])
    oninput($event:any){
        this.onKeyPress($event);
        if (!this.isCompleted && this.isRequired){
             this.formControl.control.setErrors({'LangRef':'Errors.IncorrectPhoneNumber'});
        }

        if ($event.target.value.length == 1){
            $event.target.value = '+';
        }
        
        if (this.isRequired && $event.target.value == '+'){
            this.formControl.control.setErrors({'LangRef':'Errors.Required'});
        }
    }

    @HostListener('focus', ['$event'])
    onFocus($event:any){
        if ($event.target.value.length == 0){
            $event.target.value = '+' + this.configService.country.phone_code;
        }
    }

    @HostListener('keyup', ['$event'])
    onKeyUp($event:any){

        if ($event.keyCode !== 8) {

            let value = $event.target.value.replace(/\D/g, '');

            let maskDetail = this.getMask(value);

            if (maskDetail == null)
                return;

            this.currentMask = maskDetail.mask;
            this.countryCode = maskDetail.countryCode;

            
            
            let localPhone = value.replace(this.countryCode, '');

            let formattedPhone = this.maskReplace(this.currentMask, localPhone);

            $event.target.value = formattedPhone;

        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown($event:any){


        
        if ($event.target.value.length == 0){
            $event.target.value = '+';
        }

        if ($event.keyCode === 8){
            let value = $event.target.value;

            if (isNaN(parseInt(value.charAt(value.length-1)))){
                value = value.substring(0, value.length - 1);
            }
            
            $event.target.value = value;
        }
       
    }

    @HostListener('keypress', ['$event']) 
    onKeyPress($event: any) {

        this.isCompleted = false;

        let value = $event.target.value.replace(/\D/g, '');

        let maskDetail = this.getMask(value);

        if (maskDetail == null ){
            return;
        }

        this.currentMask = maskDetail.mask;
        this.countryCode = maskDetail.countryCode;

        if (value.length >= maskDetail.minlength)
            this.isCompleted = true;

        if (value.length == maskDetail.maxlength){
            return false;
        }

        let localPhone = value.replace(this.countryCode, '');

        let formattedPhone = this.maskReplace(this.currentMask, localPhone);

        this.countrySetted.emit(this.getCountryCode(this.countryCode));

        $event.target.value = formattedPhone;
    }

    protected getCountryCode(country_phone){

        let country_code = '00';
        for(let country in this.countries){
            if (this.countries[country]['phone_code'] == country_phone){
                country_code = country;
            }
        }
        return country_code;

    }

    protected getMask(value_num:string){

        let countryMasks:Array<{index:number, maskNum:number}> = [];
        let countryCodeFinal:string = '';

        this.masks.forEach((mask, index) => {

            let maskClear:string = mask.replace('+', '');

            let countryCode:string = maskClear.substring(0, maskClear.indexOf('#')).replace(/\D/g, '');

            let maskNum:number = (maskClear.match(/#/g) || []).length;

            if (value_num.startsWith(countryCode)){

                countryCodeFinal = countryCode;
                countryMasks.push({index:index, maskNum:maskNum + countryCode.length});

            }

        });

        if (countryMasks.length == 0)
            return null;

        countryMasks.sort((a, b ) => {
            return (a.maskNum > b.maskNum) ? -1: 1;
        });

        let maxMaskLength = 0;
        let minMaskLength = 0;
        if (countryMasks.length != 0){
            maxMaskLength = countryMasks[0].maskNum;
            minMaskLength = countryMasks[countryMasks.length -1].maskNum;
        }
            

        let currentMask = null;
        countryMasks.forEach((mask) => {

            if (value_num.length <= mask.maskNum){

                currentMask = this.masks[mask.index];
            }

        });
        return {mask:currentMask, countryCode:countryCodeFinal, minlength:minMaskLength, maxlength:maxMaskLength};
        
    }

    protected maskReplace(mask:string, values:string){
        let numberFormatted = mask;

        if (this.currentMask)
        for (let i = 0; i < values.length; i++){
            
            numberFormatted = this.replace_at(numberFormatted, this.nth_index(mask, '#', i+1), values[i]);
        }

        return (numberFormatted.indexOf('#') != -1) ? numberFormatted.substr(0, numberFormatted.indexOf('#')) : numberFormatted;

    }


    private replace_at(string, index, replacement){
        return string.substr(0, index) + replacement+ string.substr(index + replacement.length);
    }

    private nth_index(str, needle, nth){
        for (let i=0;i<str.length;i++) {
            if (str.charAt(i) == needle) {
                if (!--nth) {
                    return i;    
                }
            }
        }
        return false;
    }
}

@NgModule({
    declarations:[
        PhoneMaskDirective
    ],
    exports:[
        PhoneMaskDirective
    ]
})
export class PhoneMaskModule{}