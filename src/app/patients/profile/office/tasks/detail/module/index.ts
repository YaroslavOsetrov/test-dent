import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {DetailTaskModalComponent} from './../component';

import {BsDropdownModule, ModalModule, DatepickerModule, TooltipModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';

import {CommonAppModule} from '@common/index';

import {PatientService} from '@patients/patients.service';

@NgModule({
    declarations: [
        DetailTaskModalComponent
    ],
    imports: [
        CommonAppModule,
        RouterModule,
        FormsModule,
        ModalModule
    ],
    providers:[
        PatientService
    ],
    exports: [
        DetailTaskModalComponent
    ]
})
export class DetailTaskModalModule {

}