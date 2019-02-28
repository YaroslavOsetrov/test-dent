import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule} from '@angular/forms';

import {CalendarComponent} from './calendar.component';

import {CreateModalModule} from './createModal';

import {EditModalModule} from './editModal';

import {BsDropdownModule, ModalModule, BsDatepickerModule} from 'ngx-bootstrap';

import {FullCalendar} from './fullcalendar';

import {ConfigService} from './../common/services/config';
import {CommonAppModule} from './../common';

import {OrganizationCollaborationService, OrganizationInvoice} from './../organization/organization.service';

import {OrganizationService} from '@settings/organization/service';
import {CalendarSettingsService, AppointmentService} from './calendar.service';


//import {TranslateModule} from '@ngx-translate/core';

//import {TasksService} from './../tasks/tasks.service';

import {PatientService} from './../patients/patients.service';

import {SettingsModalComponent} from './settingsModal/component';

import {TutorialsModule} from './../tutorials';

//import {DetailTaskModalModule} from './../tasks/detailModal';

import {DetailModalModule} from './../patients/profile/practice/billing/detailModal';
import {UsersListModule} from './../common/modules/users';

import {OfficeSelectComponent} from './officeSelect/component';
import {WorkhoursSelectComponent} from './workhoursSelect/component';

import {TaskBoxModule} from './taskBox';

import {StatsComponent} from './stats/component';

@NgModule({
    declarations: [
        FullCalendar,
        CalendarComponent,
        SettingsModalComponent,
        StatsComponent,

        OfficeSelectComponent,
        WorkhoursSelectComponent
    ],
    imports: [
        CommonAppModule.forRoot(),
        CreateModalModule,
        ModalModule,
        TaskBoxModule,
        DetailModalModule,
        TutorialsModule,
        EditModalModule,
        UsersListModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        RouterModule.forChild([
            { 
                path: '', component: CalendarComponent
            }
        ])
    ],
    providers:[
        CalendarSettingsService,
        OrganizationCollaborationService,
        OrganizationInvoice,
        AppointmentService,
        PatientService,
        OrganizationService
    ]
})
export class CalendarModule {

}