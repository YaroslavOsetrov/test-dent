import { Component, OnInit, OnChanges, ViewChild, Input, Inject } from '@angular/core';

import {ValidationService} from './../common/modules/validation';

import {AuthorizationService, AuthorizationToken} from './../common/services/authorization';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { LoginService } from './login.service';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from './../common/services/config';

import {BootComponent} from './../_boot/component';


@Component({
  selector: 'login-confirm',
  templateUrl: 'loginConfirm.html'
})
export class LoginConfirmComponent implements OnInit, OnChanges {

    constructor(private loginService:LoginService, private translateService:TranslateService, private authorizationService:AuthorizationService, private configService:ConfigService){}

    @Input('organizationSelection') organizationSelection:any;

    @ViewChild('boot') bootComponent:BootComponent;

	isOwnOrganization:boolean = false;

    isLoading = false;
    ngOnInit(){
    }

	ngOnChanges(){

		if (this.organizationSelection){
			
			if (this.organizationSelection.hasOwnProperty('organization'))
				this.organizationSelection.forEach(row => {

					if (this.organizationSelection.account_id == row.create_user_id){
						this.isOwnOrganization = true;
					}
				});

		}

	}


    selectOrganization(organization){
      
        this.isLoading = true;

      this.loginService.loginConfirm(organization.id, this.organizationSelection).subscribe(
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

            this.bootComponent.firstInit(token.hash);
          
        }, errors => {
            this.isLoading = false;
        }
      )
    }

}