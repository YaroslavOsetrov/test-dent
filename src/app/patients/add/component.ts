import { Component, Output, ViewChild, EventEmitter, OnInit } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';
import {ConfigService} from './../../common/services/config';

import {PatientService} from './../patients.service';

import * as moment from 'moment';

@Component({
    selector: 'addPatient-modal',
    templateUrl: 'component.html',
    exportAs:'addPatientModal'
})
export class AddPatientModalComponent implements OnInit {
 

    @ViewChild('addPatientModal') addPatientModal;
    newPatient:FormGroup;

    isSaving:boolean = false;

    localeFormat:any;

    @Output()
    patientAdded:EventEmitter<any> = new EventEmitter<any>();

    constructor(private fb:FormBuilder,
                private _configService:ConfigService,
                private patientService:PatientService
    ) {
        this.localeFormat = this._configService.country.locale_format;

        this.newPatient = this.fb.group({
            fullname:  ['', [ValidationService.requiredValidator]],
            phone:  ['', [ValidationService.requiredValidator]],
            birthday:['', [
                ValidationService.dateValidator(this.localeFormat.date_input_mask_mom, false)
            ]],
            reference_from:[''],
            keep_modal:[true],
            share_all:[true]
        });
    }

    show(){
        this.addPatientModal.show();

        mixpanel.track("patientAddShow");
    }

    ngOnInit() {

    }

    toggleCheckbox(checkbox){
        this.newPatient.controls[checkbox].setValue(!this.newPatient.controls[checkbox].value);
    }

    submit(){

        if (!this.newPatient.valid)
            return false;


        this.isSaving = true;

        let patient = this.newPatient.value;

        patient.fullname = patient.fullname.toLowerCase()
            .split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');

        if (patient['birthday'])
            patient['birthday']= moment(patient['birthday'], this.localeFormat.date_input_mask_mom).format('YYYY-MM-DD');


        this.patientService.add(patient).subscribe(
            response => {

                this.isSaving = false;

                this.patientAdded.emit({patient:response, form:this.newPatient.value});
                
                this.addPatientModal.hide();

                mixpanel.track("patientAddConfirmed");

                this.newPatient.reset();
            },
            errors => {

                mixpanel.track("patientAddError");

                this.isSaving = false;
            }
        )

        
    }
}
