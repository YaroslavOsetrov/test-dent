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

import {map} from 'rxjs/operators';

@Component({
  selector: 'login-invite',
  templateUrl: 'loginInvite.html'
})
export class LoginInviteComponent implements OnInit {

    loginInviteForm:FormGroup;

    inviteId:string;

    invite:any;

    isProcessing = false;

    isLoaded = false;

    currentLang:any;
    languages:any;

    constructor(private loginService:LoginService, 
                private fb:FormBuilder,
                private route:ActivatedRoute,
                private router:Router,
                private _swalService:SweetAlertService,
                private translateService:TranslateService,
                private authorizationService:AuthorizationService, 
                private configService:ConfigService){
        this.loginInviteForm = this.fb.group({
            email:[''],
            fullname: ['', ValidationService.nameValidator],
            phone:  ['', ValidationService.requiredValidator],
            password: ['', ValidationService.passwordValidator]
        });


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
                this.inviteId = params['ref'];

                this.loginService.checkInvite(this.inviteId).subscribe(
                    response => {
                        this.isLoaded = true;
                        this.invite = response;
                        
                        this.loginInviteForm.controls['email'].setValue(response.email);

                    },
                    errors => {
                        this.isLoaded = true;
                        this.invite = null;
                    }
                )
            });

    }

    save(){

        if (!this.loginInviteForm.valid)
            return false;


        this.isProcessing = true;

        this.loginService.confirmInvite(this.inviteId, this.loginInviteForm.value).subscribe(
            response => {
                this.isProcessing = false;

                this._swalService.message({
                    title:'login.invite.title', 
                    text:'login.invite.descr', 
                    type:'success'
                });

                this.router.navigate(['login']);

                
            },
            errors => {
                this.isProcessing = false;
                this._swalService.message({
                    title:'form.err', 
                    text:'errors.message', 
                    type:'error'
                });
            }
        )

    }


}