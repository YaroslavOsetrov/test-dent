import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';

import {OrganizationNotificationService} from './service';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'templates',
    templateUrl: 'component.html'
})
export class TemplatesComponent implements OnInit {


    notificationForm:FormGroup;

    limits = {
        create_appt:1,
        confirm_appt:1,
        edit_appt:1,
        cancel_appt:1
    }

    isSaving = false;

    isLoaded = false;

    messageBlank = {};

    constructor(private translateService:TranslateService, private fb:FormBuilder, private organizationNotificationService:OrganizationNotificationService){


        this.notificationForm = this.fb.group({
            create_appt:['', ValidationService.requiredValidator],
            is_create_appt:[''],
            confirm_appt:['', ValidationService.requiredValidator],
            is_confirm_appt:[''],
            edit_appt:[''],
            is_edit_appt:[''],
            cancel_appt:['', ValidationService.requiredValidator],
            is_cancel_appt:[''],
            upcoming_birthday:['', ValidationService.requiredValidator],
            is_upcoming_birthday:[''],
        });

        this.messageBlank = {
            fullname:this.translateService.instant('settings.templates.mess.fullname'),
            date:this.translateService.instant('settings.templates.mess.date'),
            time:this.translateService.instant('settings.templates.mess.time'),
        }

    }



    ngOnInit(){

        this.organizationNotificationService.get().subscribe(
            response => {

                this.isLoaded = true;

                for (let key in response){
                    if (typeof response[key]==='string' && key != 'organization_id' && key != 'createdAt' && key !='updatedAt'){

                        response[key] = response[key]
                            .replace('*|fullname|*', '**PATIENT-NAME**')
                            .replace('*|date|*', '**DATE**')
                            .replace('*|time|*', '**TIME**');
                    }
                    if (this.notificationForm.controls.hasOwnProperty(key))
                        this.notificationForm.controls[key].setValue(response[key]);

                    this.limits[key] = this.sizeSMS(response[key]);
                }

            }
        )
    }

    toggleNotification(type){
        this.notificationForm.controls['is_' + type].setValue(!this.notificationForm.value['is_' + type]);
        
    }

    onInputModify(key, event){

        this.limits[key] = this.sizeSMS(event.target.value)

    }

    save(){

        if (!this.notificationForm.valid){
            
            return false;
        }
        
        this.isSaving = true;
        this.organizationNotificationService.save(this.notificationForm.value).subscribe(
            response => {
                this.isSaving = false;
            }
        )

    }

    private sizeSMS(value){

        let bytes = encodeURI(value).split(/%..|./).length - 1;

        return Math.ceil(bytes/140);

    }

}