import { Component, OnInit, ViewChild, Inject, Output, EventEmitter } from '@angular/core';

import {ValidationService} from './../common/modules/validation';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { RegisterService } from './register.service';

import {TranslateService} from '@ngx-translate/core';

import {AuthorizationToken, AuthorizationService} from './../common/services/authorization';

import {ConfigService} from './../common/services/config';

import {SweetAlertService} from '@common/services/sweetalert';

import {BootComponent} from './../_boot/component';

@Component({
    selector: 'register-initial',
    templateUrl: 'register-initial.html'
})
export class RegisterInitialComponent implements OnInit {
    
    registerInitialForm:FormGroup;

    registerConfirmForm:FormGroup;

    countryCode:string = '00';

    isProcessing:boolean = false;

    @Output() userCreated: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('boot') bootComponent:BootComponent;

    tab = 1;

    constructor(private fb:FormBuilder,
                private _swalService:SweetAlertService,
                private configService:ConfigService,
                private authorizationService:AuthorizationService,
                private translateService:TranslateService,
                private registerService:RegisterService){
       
        this.registerInitialForm = this.fb.group({
            email:  ['', [ValidationService.requiredValidator, ValidationService.emailValidator]],
            password:  ['', [ValidationService.requiredValidator,ValidationService.passwordValidator]]
        });

        this.registerConfirmForm = this.fb.group({
            fullname:['', ValidationService.nameValidator],
            phone:['', [ValidationService.requiredValidator, ValidationService.phoneNumberValidator]]
        });

        this.tab = 1;
    }

    ngOnInit(){}

    onCountrySetted(country_code){
        this.countryCode = country_code;
    }

    onSubmitConfirm(){

        if (!this.registerConfirmForm.valid)
            return false;

        this.isProcessing = true;

        let user = {
            fullname:this.registerConfirmForm.value.fullname,
            phone:this.registerConfirmForm.value.phone,
            password:this.registerInitialForm.value.password,
            email:this.registerInitialForm.value.email,
            language:this.translateService.currentLang
        };

        this.registerService.createAccount(user).subscribe(
            response => {
                

                mixpanel.track("signUpConfirmed");

                this.registerService.initialLogin({account_id:response['user']['id'], organization_id:response['organization']['id']}).subscribe(
                    response => {

                        let token:AuthorizationToken = {
                            hash                    : response['token'],
                            is_expired_subscription : response['is_app_inactive']
                        }; 

                        let config = {
                            tax             : response['organization']['tax'],
                            country_code    : response['organization']['country_code'],
                            currency_code   : response['organization']['currency_code'],
                            language        : response['user']['language'],
                            timezone_offset : response['organization']['timezone_offset'],
                            organization_id : response['organization']['id']
                        };
                        
                        this.configService.init(config);

                        this.authorizationService.setToken(token);

                        this.bootComponent.afterRegistered();
                        this.bootComponent.firstInit(token.hash);

                    }, errors => {
                        this.isProcessing = false;

                        mixpanel.track("signUpError");

                        this._swalService.message({
                            title:'common.form.err',
                            text:'common.errors.'+errors.message,
                            type:'error'
                        });
                    }
                );
            }, errors => {

                mixpanel.track("signUpError");

                this.isProcessing = false;
                this._swalService.message({
                    title:'common.form.err',
                    text:'common.errors.'+errors.message,
                    type:'error'
                });

            }
        )

    }

    onSubmitInitial(){

        if (!this.registerInitialForm.valid){
            return false;
        }

        this.isProcessing = true;

        let initialForm = this.registerInitialForm.value;

        this.registerService.checkEmail({email:initialForm.email}).subscribe(
            response => {

                this.isProcessing = false;

                this.tab = 2;

                mixpanel.track("signUpOpenStep2");

            }, errors => {

                this.isProcessing = false;
                this._swalService.message({
                    title:'common.form.err',
                    text:'common.errors.'+errors.message,
                    type:'error'
                });
            }
        )
    }
}
