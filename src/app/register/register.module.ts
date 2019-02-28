import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {RegisterComponent} from './register.component';

import {RegisterInitialComponent} from './register-initial.component';

import {TranslateModule} from '@ngx-translate/core';

import { RegisterService } from './register.service';

import {BsDropdownModule} from 'ngx-bootstrap/dropdown';

import {CommonAppModule} from './../common';
import {PhoneMaskModule} from './../common/modules/phonemask';

import {BootModule} from './../_boot';

import {LanguageDropdownModule} from './../common/modules/language';


@NgModule({
    declarations: [
        RegisterComponent,
        RegisterInitialComponent
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        PhoneMaskModule,
        LanguageDropdownModule,
        BootModule,
        ReactiveFormsModule,
        BsDropdownModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: RegisterComponent, pathMatch: 'full'}
        ])
    ],
    providers:[
        RegisterService
    ]
})
export class RegisterModule {

}
