import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {PatientSelectModule} from '@patients/select';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AddTasksModalComponent} from './../component';

import {BsDropdownModule, ModalModule, DatepickerModule, TooltipModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';

import {CommonAppModule} from '@common/index';

import {PatientService} from '@patients/patients.service';

@NgModule({
    declarations: [
        AddTasksModalComponent
    ],
    imports: [
        CommonAppModule,
        FormsModule,
        PatientSelectModule,
        ModalModule
    ],
    providers:[
        PatientService
    ],
    exports: [
        AddTasksModalComponent
    ]
})
export class AddTaskModalModule {

}