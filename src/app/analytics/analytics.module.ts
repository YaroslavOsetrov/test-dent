import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';


import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {CommonAppModule} from './../common';

import {MyCurrencyPipe, DatexPipe} from './../common/pipes'

import {FormsModule} from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import {AnalyticsComponent} from './analytics.component';

import {AnalyticsService} from './analytics.service';

import { DatepickerModule, BsDropdownModule, ModalModule } from 'ngx-bootstrap';

import {PaymentChart} from './payment.chart';

import {PaymentTypesChart} from './paymentTypes.chart';

import {InvoicesChart} from './invoices.chart';
import {ProcedureTypesChart} from './procedureTypes.chart';

import {AppointmentChart} from './appointment.chart';

import {WorkhourChart} from './workhour.chart';
import {InitialAppointmentChart} from './initialAppointment.chart';

import {PaymentModalComponent} from './paymentModal.chart';
import {AppointmentModalComponent} from './appointmentModal.chart';


import {PatientChart} from './patient.chart';
import {UsersListModule} from './../common/modules/users';

import {PatientSourceChart} from './patientSource.chart';
import {PatientAgeChart} from './patientAge.chart';

import {ProceduresModalComponent} from './proceduresModal';

@NgModule({
    declarations: [
        AnalyticsComponent,

        PaymentChart,
        InvoicesChart,
        PaymentModalComponent,
        PaymentTypesChart,
        ProcedureTypesChart,
        ProceduresModalComponent,
        
        PatientChart,
        PatientSourceChart,
        PatientAgeChart,

        AppointmentChart,
        AppointmentModalComponent,

        WorkhourChart,
        InitialAppointmentChart
    ],
    imports: [
        UsersListModule,
        CommonAppModule,
        BsDatepickerModule.forRoot(),
        TranslateModule.forChild(),
        RouterModule.forChild([
            { 
                path: '', component:AnalyticsComponent,
            }
        ]),
        DatepickerModule.forRoot(),
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        FormsModule
    ],
    providers:[
        MyCurrencyPipe,
        DatexPipe,
        AnalyticsService
    ]
})
export class AnalyticsModule {

}
