import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {TranslateService} from '@ngx-translate/core';

import {ConfigService} from './../../../../../common/services/config';

import {PatientService} from './../../../../patients.service';
import {OrganizationService} from './../../../../../settings/organization/service';

@Component({
    selector: 'custom-fields',
    templateUrl: 'component.html',
    exportAs:'customFieldsModal'
})
export class CustomFieldsModalComponent implements OnInit {

    @Output('fieldsChanged') fieldChanged:EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('customFieldsModal') customFieldsModal:any;

    isSaving = false;

    fields = [];

    fieldsDefault = [];

    localeFormat:any;
    
    editableIndexes = {};

    maxFields = 6;

    fieldTypes = ['text', 'date', 'phone', 'address'];

    constructor(private _patientService:PatientService,
                private _organizationService:OrganizationService,
                private _configService:ConfigService){

        this.localeFormat = this._configService.country.locale_format;
    }

    ngOnInit(){

        this._organizationService.getCustomFields().subscribe(
            response => {
                this.fields = response;
                this.fieldsDefault = response;
            }
        )

    }

    show(){
        this.customFieldsModal.show();

        mixpanel.track("patientCustomFieldsAddShow");
    }

    addField(){
        this.fields.push({
            field_name:'',
            field_type:'text',
            is_added:true
        });
    }

    deleteField(index){
        this.fields.splice(index, 1);
    }

    reset(){
        this.fields = this.fieldsDefault;
    }

    save(){

        this.isSaving = true;


        mixpanel.track("patientCustomFieldsAddConfirmed");
        this._organizationService.addCustomFields(this.fields).subscribe(
            response => {
                this.isSaving = false;
                this._configService.custom_fields = response;
                this.fieldChanged.emit(response);
                this.customFieldsModal.hide();
            }
        )
    }

    /*

    delete_field(index){

        this.customFields.splice(index, 1);

        this.updateExisting();

    }

    toggle_edit(index){

        this.editableIndexes[index] = !this.editableIndexes[index];


    }

    ngOnInit(){

        this.organizationCustomFieldService.get().subscribe(
            response => {
                this.fields = response;
            }
        )

    }

    update_field(index){
        this.toggle_edit(index);

        this.updateExisting();
        
    }

    private updateExisting(){
         this.organizationCustomFieldService.add(this.customFields).subscribe(
            response => {
                this.configService.custom_fields = response
                this.fieldChanged.emit(response)
            }
        )
    }

    saveField(i){
        let fields = this.customFields;

        fields.push(this.customFieldsAdded[i]);

        if (!this.customFieldsAdded[i]['field_name'])
            return false;

        this.customFieldsAdded.splice(i, 1);

        this.organizationCustomFieldService.add(fields).subscribe(
            response => {
                this.configService.custom_fields = response;
                this.fieldChanged.emit(response);
            }
        )
    }

    save(){
        this.isSaving = true;
        this.organizationCustomFieldService.add(this.fields).subscribe(
            response => {
                this.isSaving = false;

                this.configService.custom_fields = response;

                this.fieldChanged.emit(response);
            }
        )
    }
    */
}