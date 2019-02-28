import {NgModule} from '@angular/core'

import {CommonAppModule} from '@common/index';

import {SelectAppointmentComponent} from './component';

@NgModule({
    declarations: [
        SelectAppointmentComponent
    ],
    imports: [
        CommonAppModule
    ],
    exports: [
        SelectAppointmentComponent
    ]
})
export class SelectAppointmentModule {
    
}