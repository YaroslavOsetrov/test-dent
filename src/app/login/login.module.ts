import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {LoginComponent} from './login.component';

import {ValidationModule} from './../common/modules/validation';

import {TranslateModule} from '@ngx-translate/core';

import { LoginService } from './login.service';

import {AuthorizationService} from './../common/services/authorization';

import {ConfigService} from './../common/services/config';

import {LoginConfirmComponent} from './loginConfirm';

import {LoginInviteComponent} from './loginInvite';

import {BootModule} from './../_boot';

import { LaddaModule } from 'angular2-ladda';

import {PhoneMaskModule} from './../common/modules/phonemask';

import {LoginRecoveryComponent} from './loginRecovery';

import {BsDropdownModule} from 'ngx-bootstrap/dropdown';

import {LanguageDropdownModule} from './../common/modules/language';

@NgModule({
    declarations: [
        LoginComponent,
        LoginConfirmComponent,
        LoginInviteComponent,
        LoginRecoveryComponent
    ],
    imports: [
        CommonModule,
        ValidationModule,
        LanguageDropdownModule,
        LaddaModule,
        BootModule,
        ReactiveFormsModule,
        PhoneMaskModule,
        TranslateModule.forChild(),
        BsDropdownModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: LoginComponent, pathMatch: 'full'},
            { path: 'invite', component: LoginInviteComponent, pathMatch: 'full'},
            { path: 'recovery', component: LoginRecoveryComponent, pathMatch: 'full'}
        ])
    ],
    providers:[
        LoginService
    ]
})
export class LoginModule {

}
