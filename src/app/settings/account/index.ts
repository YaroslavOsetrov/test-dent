import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {AccountComponent} from './component';

import {AccountService} from './service';

import {CommonAppModule} from './../../common';


import { LaddaModule } from 'angular2-ladda';


import {NgxUploaderModule} from 'ngx-uploader';

import {AuthorizationService} from './../../common/services/authorization';

import {AccountGeneralComponent} from './general';
import {AccountChangePasswordComponent} from './changePassword';

@NgModule({
    declarations: [
        AccountComponent,

        AccountGeneralComponent,
        AccountChangePasswordComponent
    ],
    imports: [
        CommonModule,
        CommonAppModule,
    //    GooglePlaceModule,
    //    ValidationModule,
        TranslateModule.forChild(),
    //    LaddaModule.forRoot({
        //    spinnerColor:'#4160c3'
      
        NgxUploaderModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { 
                path: '', component: AccountComponent
            }
        ])
    ],
    providers:[
        AccountService
      //  AuthorizationService
    ]
})
export class AccountModule {

}