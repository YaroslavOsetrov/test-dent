import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {ValidationModule} from './../../common/modules/validation';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CreateModalComponent} from './component';

import {BsDropdownModule, ModalModule, DatepickerModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';
import {ConfigService} from './../../common/services/config';

import {CommonAppModule} from './../../common';

import {PatientSelectModule} from './../../patients/select';

import {AppointmentService} from './../calendar.service';

import {PatientService, PatientTaskService} from './../../patients/patients.service';

import {LaddaModule} from 'angular2-ladda';

import {UsersListModule} from '@common/modules/users';

import {PhoneMaskModule} from '@common/modules/phonemask';
import {TextareaAutoresizeModule} from '@common/modules/autoresize';

import {ApptComponent} from './appt';
import {TaskComponent} from './task';
import {NoteComponent} from './note';

@NgModule({
    declarations: [
        CreateModalComponent,

        ApptComponent,
        TaskComponent,
        NoteComponent

    ],
    imports: [
        CommonAppModule.forRoot(),
        PatientSelectModule,
     //   TagsAreaModule,
        FormsModule,
        PhoneMaskModule,
        ReactiveFormsModule,
        ModalModule,
        UsersListModule
    ],
    providers:[
        ConfigService,
        AppointmentService,
        PatientTaskService,
   //     SubscriptionService
    ],
    exports: [
        CreateModalComponent
    ]
})
export class CreateModalModule {

}