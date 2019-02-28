import { Component, OnInit, Inject } from '@angular/core';

import {ValidationService} from './../common/modules/validation';

import {AuthorizationService} from './../common/services/authorization';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { LoginService } from './login.service';

import { Router } from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {ConfigService} from './../common/services/config';

import {SweetAlertService} from '@common/services/sweetalert';


export class Registration{
    Email   :string;
    Password:string;
}

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginComponent implements OnInit {
    
    loginForm:FormGroup;

    isProcessing:boolean = false;

    organizationSelection = null;

    currentLang:any;
    
    constructor(private fb:FormBuilder,
                private router:Router,
                private _swalService:SweetAlertService,
                private configService:ConfigService,
                private translateService:TranslateService,
                private authorizationService:AuthorizationService,
                private loginService:LoginService){
       
        this.loginForm = this.fb.group({
            email:  ['', [ValidationService.requiredValidator, ValidationService.emailValidator]],
            password:  ['', [ValidationService.requiredValidator,ValidationService.passwordValidator]]
        });

    }

    ngOnInit() {

        
        
    }

    changeLang(language){

        this.currentLang = language;

        this.configService.init({
            language:language['value'],
            country_code:null,
            currency_code:null,
            organization_id:null,
            tax:0,
            timezone_offset:0
        });

        location.reload();

    }

    onSubmit(){
        
        if (!this.loginForm.valid){
            return;
        }

        this.isProcessing = true;

        this.loginService.login(this.loginForm.value).subscribe(
            response => {
                this.organizationSelection = response; 
            }, 
            errors => {
                this.isProcessing = false;
                this._swalService.message({
                    title:'common.form.err',
                    text:'common.errors.'+errors.message,
                    type:'error'
                })
            }
        );
    }
}
