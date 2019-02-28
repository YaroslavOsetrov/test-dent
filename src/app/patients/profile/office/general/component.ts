import {Component, OnInit} from '@angular/core';

import {FormGroup, FormBuilder} from '@angular/forms';

import {ValidationService} from './../../../../common/modules/validation';

import {ConfigService} from './../../../../common/services/config';

import {PatientService} from './../../../patients.service';

import * as moment from 'moment';

@Component({
    selector: 'general',
    templateUrl: 'component.html'
})
export class GeneralComponent implements OnInit {
    
    isLoaded = false;
    isSaving = false;
    isChanged = false;

    patientGeneralForm:FormGroup;

    localeFormat:any;

    account:any;

    patientDefault:any;

    customFields = [];
    customFieldsValue = {};

    constructor(private _fb:FormBuilder,
                private _patientService:PatientService,
                private _configService:ConfigService
    ){

        this.localeFormat = this._configService.country.locale_format;

        this.customFields = this._configService.custom_fields;

        this.account = this._configService.account;

        this.patientGeneralForm = this._fb.group({
            fullname:['', [ValidationService.requiredValidator]],
            phone:['', [ValidationService.requiredValidator]],
            birthday:['', [
                ValidationService.dateValidator(this.localeFormat.date_input_mask_mom, false)
            ]],
            address:[''],
            reference_from:[''],
            email:[''],
            custom_fields:['']
        });

    }

    ngOnInit(){
      
        
        this._patientService.patient$.subscribe(
            response => {
                this.patientDefault = response;
                
                if (Object.keys(response).length != 0){
                    this._setFormData(response);
                    this.isLoaded = true;
                    this.isChanged = false;
                }
                    
            }
        )

        this.patientGeneralForm.valueChanges.subscribe(form => {
            
            if (this.isLoaded)
                this.isChanged = true;
        });

       
    }

    reset(){

        this._setFormData(this.patientDefault);
        this.isChanged = false;
    }

    save(){
         if (!this.patientGeneralForm.valid)
            return false;

        this.isSaving = true;

        this.patientDefault.patient_user.fullname = this.patientGeneralForm.value.fullname;
        this.patientDefault.patient_user.phone = this.patientGeneralForm.value.phone;
        
        if (this.patientGeneralForm.value.birthday)
            this.patientDefault.patient_user.birthday =  moment(this.patientGeneralForm.value.birthday, this.localeFormat.date_input_mask_mom, true).format('YYYY-MM-DD');
        else
            this.patientDefault.patient_user.birthday = null;

        this.patientDefault.custom_fields = this.customFieldsValue;
        this.patientDefault.patient_user.address = this.patientGeneralForm.value.address;

        this.patientDefault.reference_from = this.patientGeneralForm.value.reference_from;
        this.patientDefault.email = this.patientGeneralForm.value.email;
        

        this.isChanged = false;
        this._patientService.save(this.patientDefault.id, this.patientDefault).subscribe(
            response => {

                mixpanel.track("patientSavedOk");

                
                this.isSaving = false;
            }, errors => {
                mixpanel.track("patientSavedErrors");
            }
        );

    }

    onFieldsChanged(data){
        this.customFields = data;
    }

    private _setFormData(patient){
        this.patientGeneralForm.controls.fullname.setValue(patient.patient_user.fullname);
        this.patientGeneralForm.controls.phone.setValue(patient.patient_user.phone);

        if (patient.patient_user.birthday)
            this.patientGeneralForm.controls.birthday.setValue(moment(patient.patient_user.birthday, 'YYYY-MM-DD').format(this.localeFormat.date_input_mask_mom));
        
        this.patientGeneralForm.controls.address.setValue(patient.patient_user.address);
        this.patientGeneralForm.controls.reference_from.setValue(patient.reference_from);
        this.patientGeneralForm.controls.email.setValue(patient.email); 

         try{
            let fields = JSON.parse(patient.custom_fields);

            this.customFields.forEach((row) => {
                this.customFieldsValue[row['field_name_internal']] = (fields[row['field_name_internal']])? fields[row['field_name_internal']] : '';
            })
        }catch(e){
            this.customFieldsValue = {};

            this.customFields.forEach((row) => {
                this.customFieldsValue[row['field_name_internal']] = '';
            })
        } 
    }

    
}