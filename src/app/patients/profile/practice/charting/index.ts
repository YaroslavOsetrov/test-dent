import {NgModule} from '@angular/core'

import {CommonModule} from '@angular/common';

import {FormsModule} from '@angular/forms';

import {CommonAppModule} from './../../../../common';
import {ChartingComponent} from './component';

import {PlansListComponent} from './plansList/component';
import {ProceduresListComponent} from './proceduresList/component';

import {TeethModule} from './teeth';

import {ProceduresModule} from './procedures';

import {AddPlanComponent} from './addPlan/component';
import {AddDiagnosisComponent} from './addDiagnosis/component';

import {SelectAppointmentModule} from './selectAppointment';

import {ModalModule} from 'ngx-bootstrap/modal';
import {TabsModule} from 'ngx-bootstrap/tabs';

import {ProcedureSelectModule} from './selectProcedure';

import {ICD10Service} from './../../../patients.service';


@NgModule({
    declarations: [
        ChartingComponent,
        PlansListComponent,
        ProceduresListComponent,
        AddPlanComponent,
        AddDiagnosisComponent
    ],
    imports: [
        CommonAppModule,
        SelectAppointmentModule,
        FormsModule,
        TabsModule,
        ModalModule.forRoot(),
        TeethModule,
        ProcedureSelectModule,
        ProceduresModule
    ],
    exports: [
        ChartingComponent
    ],
    providers:[ICD10Service]
})
export class ChartingModule {
    
}