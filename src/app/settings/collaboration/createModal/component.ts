import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {UserRoleModel} from './../../../common/models/user/user_role';

import {ConfigService} from './../../../common/services/config';

import {CollaborationService} from './../service';

import {TranslateService} from '@ngx-translate/core';

import * as moment from 'moment';

import {FormBuilder, FormGroup} from '@angular/forms';

import {ValidationService} from './../../../common/modules/validation';

@Component({
    selector: 'create-modal',
    templateUrl: 'component.html',
    exportAs:'createModal'
})
export class CreateModalComponent implements OnInit {

    @ViewChild('createModal') createModal;

    @Output('userAdded') userAdded:EventEmitter<any> = new EventEmitter<any>();

    isSubmitted = false;

    newUser:FormGroup;

    constructor(
                private fb:FormBuilder,
                private configService:ConfigService, 
                private translateService:TranslateService,
                private collaborationService:CollaborationService){

        this.newUser = this.fb.group({
            fullname:['', ValidationService.requiredValidator],
            email:['', ValidationService.emailValidator],
            online_access:[false],
            is_doctor:[true],
            view_patient:[false]
        });
                    

    }

    ngOnInit(){

    }

    show(){
        this.createModal.show();

        mixpanel.track("settingsCollaborationCreateOpen");
    }

    toggleCheckbox(checkbox){
        this.newUser.controls[checkbox].setValue(!this.newUser.controls[checkbox].value);
    }

    submit(){

        if (!this.newUser.valid){
            return false;
        }

        mixpanel.track("settingsCollaborationCreateConfirmed");

        this.isSubmitted = true;
        
        this.collaborationService.addInvitation(this.newUser.value).subscribe(
            response => {
                this.newUser.reset();

                this.userAdded.emit(response);

                this.createModal.hide();

                this.isSubmitted = false;
            },
            errors => {
                
                this.isSubmitted = false;

                this.newUser.reset();
            }
        );
    }


}