import { Component, OnInit, Input, Inject } from '@angular/core';

import {ValidationService} from './../common/modules/validation';

import {ActivatedRoute, Router} from '@angular/router';

import {AuthorizationService} from './../common/services/authorization';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { LoginService } from './login.service';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from './../common/services/config';

import * as Languages from './../../../public/i18n/languages/index.json';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
  selector: 'login-recovery',
  templateUrl: 'loginRecovery.html'
})
export class LoginRecoveryComponent implements OnInit {

    loginRecoveryRequest:FormGroup;

    isSubmitRequest = false;
    isSubmitConfirm = false;

    confirmationToken:any;

    tokenConfirmed = false;

    loginRecoveryConfirm:FormGroup;

    currentLang:any;
    languages:any;

    constructor(private fb:FormBuilder, private _swalService:SweetAlertService, private translateService:TranslateService, private router:Router, private route:ActivatedRoute, private loginService:LoginService){
        this.loginRecoveryRequest = this.fb.group({
            email:  ['', [ValidationService.requiredValidator, ValidationService.emailValidator]]
        });

        this.loginRecoveryConfirm = this.fb.group({
            matchingPassword: this.fb.group({
                password_new: ['', ValidationService.passwordValidator],
                password_new2: ['']
            }, {
                validator:ValidationService.areEqual
            })
        })

        this.languages = Languages;
        
        this.languages.forEach(lang => {

            if (lang['value'] == this.translateService.currentLang)
                this.currentLang = lang;
        });
    }

    changeLang(language){

        this.currentLang = language;

        this.translateService.use(language['value']);

    }

    ngOnInit(){
        
         this.route.queryParams
            .subscribe((params) => {
                this.confirmationToken = params['token'];
                if (this.confirmationToken){
                    this.loginService.validateRecovery({id:this.confirmationToken}).subscribe(
                        response => {
                            this.tokenConfirmed = true;
                        }
                    )
                }
            });

    }

    onSubmitConfirm(){

        if (!this.loginRecoveryConfirm.valid)
            return false;

        this.isSubmitConfirm = true;

        this.loginService.confirmRecovery({id:this.confirmationToken, password:this.loginRecoveryConfirm.value.matchingPassword.password_new}).subscribe(
            response => {
                this.isSubmitConfirm = false;

                this._swalService.message({
                    title:'login.recovery.confirmed.title',
                    text:'login.recovery.confirmed.descr',
                    type:'success'
                });
           
                this.router.navigate(['/login']);
            },
            errors => {
                this.isSubmitConfirm = false;

                this._swalService.message({
                    title:'common.form.err',
                    text:'commmon.errors.'+errors.message,
                    type:'error'
                });
            }
        )

    }

    onSubmitRequest(){

        if (!this.loginRecoveryRequest.valid)
            return false;

        this.isSubmitRequest = true;
        
        this.loginService.requestRecovery(this.loginRecoveryRequest.value).subscribe(
            response => {
                this.isSubmitRequest = false;

                 this._swalService.message({
                    title:'login.recovery.request.title',
                    text:'login.recovery.request.descr',
                    type:'success'
                });
            }, errors => {
                this.isSubmitRequest = false;

                this._swalService.message({
                    title:'common.form.err',
                    text:'commmon.errors.'+errors.message,
                    type:'error'
                });
            }
        );
    }



}