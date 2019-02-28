import { Component, Input, OnInit, EventEmitter } from '@angular/core';

import {UserModel} from './../../common/models/user/main';

import {AccountService} from './service';

import * as Languages from './../../../../public/i18n/languages/index.json';

import {TranslateService} from '@ngx-translate/core';


import {FormBuilder, FormGroup, FormControl, Validators, NgControl} from '@angular/forms';

import {ValidationService} from './../../common/modules/validation';

import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';

import {AuthorizationService} from './../../common/services/authorization';

import {ConfigService, API_PREFFIX} from './../../common/services/config';

import { environment } from '../../../environments/environment';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'change-password',
    templateUrl: 'changePassword.html'
})
export class AccountChangePasswordComponent implements OnInit {


    form:FormGroup;

    @Input()
    account:UserModel;

    isSaving = false;

    constructor(private fb:FormBuilder, private _swalService:SweetAlertService, private configService:ConfigService, private authService:AuthorizationService, private accountService:AccountService, private translateService:TranslateService){
        this.form = this.fb.group({
            password:['', ValidationService.passwordValidator],
            matchingPassword: this.fb.group({
                password_new: ['', ValidationService.passwordValidator],
                password_new2: ['']
            }, {
                validator:ValidationService.areEqual
            })
        });
    }

    ngOnInit(){
        
    }

    save(){

        if (!this.form.valid){
            return false;
        }

        this.account.password = this.form.controls['password'].value;
        this.account.password_new = (<FormGroup>this.form.controls['matchingPassword']).controls['password_new'].value;

        this.isSaving = true;
        this.accountService.save(this.account).subscribe(
            response => {
                this.isSaving = false;

                this._swalService.message({
                    title:'login.recovery.confirmed.title',
                    text:'login.recovery.confirmed.descr',
                    type:'success'
                })

                this.form.reset();
                
            },
            errors => {
                this.isSaving = false;

                this._swalService.message({
                    title:'common.form.err',
                    text:'common.errors.OLD_PW_WRONG',
                    type:'error'
                })
            }
        )

    }

}