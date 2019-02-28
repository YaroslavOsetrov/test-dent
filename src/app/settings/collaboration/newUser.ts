import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import {FormBuilder, FormGroup} from '@angular/forms';

import {CollaborationService} from './service';

import {ValidationService} from './../../common/modules/validation';

import {TranslateService} from '@ngx-translate/core';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'new-user',
    templateUrl: 'newUser.html'
})
export class NewUser implements OnInit {

    isLoading = false;

    newUser:FormGroup;

    @Output('userAdded') userAdded:EventEmitter<any> = new EventEmitter<any>();

    constructor(private fb:FormBuilder,
                private _swalService:SweetAlertService,
                private translateService:TranslateService,
                private collaborationService:CollaborationService){

        this.newUser = this.fb.group({
            fullname:['', ValidationService.requiredValidator],
            email:['', ValidationService.emailValidator],
            is_online_access:[false],
            is_dentist:[false]
        });
    }

    ngOnInit(){

    }

    onSubmit(){

        if (!this.newUser.valid){
            return false;
        }

        this.isLoading = true;
        
        this.collaborationService.addInvitation(this.newUser.value).subscribe(
            response => {
                this.newUser.reset();
                this.userAdded.emit(response);
                this.isLoading = false;
            },
            errors => {
                
                this.isLoading = false;

                this.newUser.reset();

                this._swalService.message({
                    title:'common.form.err',
                    text:'common.errors.'+errors.message,
                    type:'error'
                });
            }
        );
    }
}