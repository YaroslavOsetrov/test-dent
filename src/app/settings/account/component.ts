import { Component, OnInit, EventEmitter } from '@angular/core';

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

@Component({
    selector: 'account',
    templateUrl: 'component.html'
})
export class AccountComponent implements OnInit {


    account:UserModel = {};

    constructor(private configService:ConfigService, private accountService:AccountService){

    }


    ngOnInit(){

        this.accountService.get().subscribe(
            response => {

                mixpanel.track("settingsAccountOpen");
                
                this.account = response;
            }
        );

    }

   
}