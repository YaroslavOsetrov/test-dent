import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule} from '@angular/forms';

import {ProceduresComponent} from './component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import {ModalModule} from 'ngx-bootstrap/modal';

import {TranslateModule} from '@ngx-translate/core';

import {ProceduresService} from './service';

import {ConfigService} from '@common/services/config';

import {CommonAppModule} from '@common/index';

import {ProcedureSearchPipe } from './procedureSearch.pipe';

import {InventoryTableComponent} from './inventoryTable/component';

import {InventorySelectModule} from './../inventory/select';
import {InventoryService} from './../inventory/service';

@NgModule({
    declarations: [
        ProceduresComponent,
        ProcedureSearchPipe,

        InventoryTableComponent
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        InventorySelectModule,
        FormsModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        BsDropdownModule.forRoot(),
        TranslateModule.forChild(),
     /*   RouterModule.forChild([
            { path: '', component: PriceComponent, pathMatch: 'full'}
        ])*/
    ],
    exports:[ProceduresComponent],
    providers:[ProceduresService, ConfigService, InventoryService]
})
export class ProceduresModule {

}
