import { NgModule } from "@angular/core";

import {CommonModule} from '@angular/common';

import  { ValidationMessage } from './ValidationMessage';

import {FormGroup, AbstractControl} from '@angular/forms';

import * as moment from 'moment';

import {TranslateModule} from '@ngx-translate/core';

import * as phoneCodes from './../../../../../public/json/phone_codes.json';

import {MaskPipe} from 'ngx-mask';

interface ValidationResult{
    [key:string]:boolean;
}


class DateValidator {
    constructor(private dateFormat: string) {}

    
    dateValidator(control: any): { [s: string]: boolean } {
        if (isNaN(control['value'])) {
            return { npiNAN: true };
        }
    }
}
export class ValidationService {


    static phoneNumberValidator(control){
        let validatedStart = false;
        let validatedEnd = false;
        if (control != null)
        if (control.value != null){
           
            phoneCodes['items'].forEach((mask, index) => {

                let countryCode = mask.substring(0, mask.indexOf('#')).replace(/\D/g, '');

                if (control.value.startsWith('+'+countryCode)){

                    validatedStart = true;
                    if (control.value.length != mask.length){

                        let maxLengthArray = [];

                        phoneCodes['items'].forEach((mask, index) => {

                            if (control.value.startsWith('+' + mask.substring(0, mask.indexOf('#')).replace(/\D/g, ''))){
                               maxLengthArray.push(mask.length);
                            }
                        });

                        validatedEnd = false;

                        maxLengthArray.forEach((length) => {
                            if (control.value.length == length){
                                validatedEnd = true;
                            }
                        })
                       
                    }
                    else{
                        validatedStart = true; validatedEnd = true;
                    }
                }

            });
            if (validatedStart && validatedEnd){
                return null;
            }else if (!validatedStart){
                return {'LangRef':'PHONE_START'};
            }else {
               return {'LangRef':'PHONE_ALL'}; 
            }

        }

    }

    static creditCardValidator(control) {
        // Visa, MasterCard, American Express, Diners Club, Discover, JCB
        if (control.value != null){
            if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
                return null;
            } else {
                return {'LangRef':'CARD'};
            }
        }

    }

    static numericValidator(control){

        if (control.value != null){
            if (control.value.match(/^\d+$/) && control.value != '0'){
                return null;
            } else {
                return {'LangRef':'NUMERIC'};
            }
        }

    }

    static dateValidator (dateFormat:string, is_required?:boolean) {
         return (control:AbstractControl) => {
            
            if (control.value != null){

                if (control.value.length > 1){
                    
                    let d = moment(control.value, dateFormat, true).isValid();
                    if (!d) {
                        return {'LangRef':'DATE'};
                    }
                }else
                    if (is_required){
                         return {'LangRef':'REQUIRED'};
                    }
            }else
                if (is_required){
                        return {'LangRef':'REQUIRED'};
                }
         }
    }

    static requiredValidator(control){
        if (control != null)
        if (control.value == null){
            return {'LangRef':'REQUIRED'};
        }else{
            if (control.value.length > 0){
                return null;
            }else{
                return {'LangRef':'REQUIRED'};
            }
        }

    }

    static emailValidator(control) {

        if (control != null)
        // RFC 2822 compliant regex
        if (control.value != null){
            if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
                return null;
            } else {
                return {'LangRef':'EMAIL'};
            }
        }

    }

    static nameValidator(control){

        if (control.value != null){
            if (control.value.length >= 2){
                return null;
            }else{
                return {'LangRef':'NAME'}
            }
        }

    }

    static passwordValidator(control) {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (control.value != null){
            if (control.value.match(/^[a-zA-Z0-9!@#$%^&*]{6,16}$/)) {
                return null;
            } else {
                return {'LangRef':'PASSWORD'};
            }
        }

    }

    static areEqual(group: FormGroup) {
        let val;
        let valid = true;

        for (let name in group.controls) {
            if (val === undefined) {
                val = group.controls[name].value
            } else {
                if (val !== group.controls[name].value) {
                    group.controls[name].setErrors({'LangRef':'EQUAL'});
                    valid = false;
                    break;
                }
            }
        }

        if (valid) {
            return null;
        }
        return {'LangRef':'EQUAL'};
    }
}

@NgModule({
    declarations:[
        ValidationMessage
    ],
    imports:[CommonModule, TranslateModule.forChild()],
    providers:[
        ValidationService
    ],
    exports: [
        ValidationMessage
    ]
})
export class ValidationModule{}