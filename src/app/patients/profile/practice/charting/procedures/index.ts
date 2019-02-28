import {NgModule} from '@angular/core'

import {CommonModule} from '@angular/common';
import {CommonAppModule} from './../../../../../common';

import {TeethModule} from './../teeth';

import {AppointmentService} from '@calendar/calendar.service';

import {AddInventoryModule} from './../addInventory';

import {ModalModule} from 'ngx-bootstrap/modal'; 

import {ProceduresComponent} from './component';

import {CreateBillingModalModule} from './../../billing/createModal';

import {SelectAppointmentModule} from './../selectAppointment';

@NgModule({
    declarations: [
        ProceduresComponent
    ],
    imports: [
        TeethModule,
        AddInventoryModule,
        SelectAppointmentModule,
        ModalModule,
        CommonAppModule,
        CreateBillingModalModule
    ],
    exports: [
        ProceduresComponent
    ],
    providers:[AppointmentService]
})
export class ProceduresModule {
    
}